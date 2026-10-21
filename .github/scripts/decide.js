// Glue only. Both trust decisions are made by Elastic's own scripts, vendored
// verbatim under .github/scripts/workflows/lib/ from
// elastic/terraform-provider-elasticstack@b26cfcc426523f629b6a8604861932b519f1a517
//
// This file adds no policy of its own: it reads the pull request's file list,
// calls each vendor function with the inputs that function accepts, and prints
// both answers side by side.

const fs = require('fs');
const { classifyPullRequest } = require('./workflows/lib/classify-pr.js');
const { selectChangeForPullRequest } = require('./workflows/lib/select-change.js');

const raw = JSON.parse(fs.readFileSync(process.env.FILES_JSON, 'utf8'));
const files = raw.map(f => ({ filename: f.filename, status: f.status }));

const prNumber = Number(process.env.PR_NUMBER);
const headRepoId = Number(process.env.HEAD_REPO_ID);
const baseRepoId = Number(process.env.BASE_REPO_ID);
const isFork = headRepoId !== baseRepoId;

const archive = classifyPullRequest({ headRepoId, baseRepoId });
const review = selectChangeForPullRequest({ prNumber, files });

console.log('BASE_REPO            = ' + process.env.GITHUB_REPOSITORY + '  (id ' + baseRepoId + ')');
console.log('HEAD_REPO            = ' + process.env.HEAD_REPO + '  (id ' + headRepoId + ')');
console.log('IS_FORK              = ' + isFork);
console.log('FILES                = ' + JSON.stringify(files));
console.log('');
console.log('--- the fork-aware decision ---------------------------------------');
console.log('classify-pr.js({ headRepoId, baseRepoId })');
console.log('  archive_push_allowed = ' + archive.archive_push_allowed);
console.log('  ' + archive.archive_push_allowed_reason);
console.log('');
console.log('--- the decision that is not fork-aware ----------------------------');
console.log('select-change.js({ prNumber, files })   <- takes no repository input');
console.log('  review_disposition   = ' + review.review_disposition);
console.log('  ' + review.disposition_reason);
console.log('');

if (isFork && review.review_disposition === 'approval-eligible') {
  console.log('[LEAK] fork pull request, archive/push refused, APPROVE permitted.');
} else if (isFork) {
  console.log('[OK]   fork pull request was not approval-eligible.');
} else {
  console.log('[control] same-repository pull request.');
}

fs.appendFileSync(
  process.env.GITHUB_OUTPUT,
  'review_disposition=' + review.review_disposition + '\n' +
    'archive_push_allowed=' + archive.archive_push_allowed + '\n' +
    'is_fork=' + isFork + '\n'
);
