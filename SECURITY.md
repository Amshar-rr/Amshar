# Security Policy

## Supported Versions

Only the latest version on the `main` branch is supported with security fixes.

## Reporting a Vulnerability

Please **do not** report security issues in public issues or discussions.

Instead, use GitHub's private reporting: go to the **Security** tab of this repository and choose **Report a vulnerability**. If that is unavailable, contact the maintainer (Amshar) via the contact details on the GitHub profile.

Please include:

- A description of the issue and its impact
- Steps to reproduce
- Any suggested fix

You can expect an initial response within a few days. Once the issue is fixed, you will be credited if you wish.

## Notes for contributors

- Never commit passwords, service-role keys or other secrets
- Keep Supabase Row Level Security (RLS) policies enabled and review them when changing `supabase.sql`
