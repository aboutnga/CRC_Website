# 생활정보: completed before 6am Pacific

Activated in the owner's Cloudflare account on November 1, 2026. The website design is unchanged.

## Current deployment
- Account: 9d61d49c7902a95a3cecf2f031ebc249 (aboutnga).
- Worker: crc-daily-scheduler; enabled, with a once-per-minute Cron trigger.
- STATE: crc-daily-scheduler-state (1ba6a19f645046c9a8907b05c25d7ef6).
- GITHUB_DISPATCH_TOKEN is an encrypted Worker secret, restricted to aboutnga/CRC_Website, Actions read/write and metadata read-only; expires January 30, 2027. Rotate before expiry.
- No alert webhook is configured. Deadline misses are logged, not sent to staff.
- Manual daily workflow run 41324137355 passed and deployed the November 1 edition (commit e46b620761b2acdc2d43117fee36f9097d720943).
- Mocked scheduler tests passed; Cloudflare scheduled-event tester returned success. A timed production dispatch and the first morning deadline still require observation.
- Dashboard deployment uses the bundled daily-window helpers plus index.mjs. Keep this source and configuration synchronized with future dashboard edits.

## Schedule
- 5:15am: begin full collection, validate today's images and bilingual edition, build, publish through the existing GitHub-to-Pages integration.
- 5:15am–6:30am: the independent Worker checks live daily-feed.json every five minutes. A current bilingual edition and current image date stop morning retries. Otherwise it dispatches the existing GitHub workflow, unless a job is already active.
- 6:00am: an unverified edition produces a deadline error and an optional approved webhook alert. Recovery continues. Do not treat a successful dispatch or commit as a completed deployment.
- 6:07am–4:37pm: half-hour news triggers. At 5pm, publication freezes. Overnight :07 collections retain stories without changing the displayed edition.
- All decisions use America/Los_Angeles, including DST. GitHub's 5:15, 5:30 and 5:45 morning triggers remain backups.

This is a deadline target, not an unconditional guarantee: source outages, GitHub runner delays and Cloudflare deployment failures can still prevent success. The Worker bypasses GitHub's cron scheduler but the collection job still needs a GitHub runner. Escalate repeated runner delays to a dedicated execution service rather than promising exact-time delivery.

## Reinstallation checklist
1. Review and test the branch, then approve merging it. A merge can trigger the existing Pages integration.
2. Confirm crcnow.org points to the intended Pages production project and daily-feed.json exposes imagesCapturedAt.
3. Create a Cloudflare KV namespace and replace the placeholder id in workers/daily-scheduler/wrangler.jsonc.
4. Add GITHUB_DISPATCH_TOKEN as a Worker secret: fine-grained GitHub token restricted to aboutnga/CRC_Website with Actions read/write and metadata read. Do not paste tokens into chat, source or logs. No Contents write permission is needed for this scheduler; the existing workflow uses its own built-in token.
5. Optionally configure an approved ALERT_WEBHOOK_URL secret. Without it deadline failures are Worker errors/logs, not a direct notification. Select and test an alert destination before declaring monitoring operational.
6. Deploy the Worker disabled, verify account/bindings, then enable ENABLED=true within the owner's authorization. Its only write endpoint is GitHub workflow_dispatch on main; it never edits website code or deploys directly.
7. Observe at least one morning live, verify edition date, image date and English/Korean stories by 6am, and confirm 5pm freeze.

## Local checks and rollback
Run node scripts/test-daily-scheduler.mjs, the existing scripts/test-*.ts via tsx, and npm run build. Scheduler tests mock every network request and cannot dispatch production jobs.
Disable the Worker with ENABLED=false or remove its Cron trigger to stop independent dispatches; GitHub backup schedules remain. Revert the scheduling branch through a reviewed commit if required. Never force-push over automated news updates.

KV deduplication is best effort (eventually consistent). Existing GitHub concurrency and publication timestamp/non-force guards remain important. Read-only cron overlap checks prevent routine duplicate queued runs; they are not a distributed lock.

