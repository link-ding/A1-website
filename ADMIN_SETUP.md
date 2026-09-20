# Academy One website admin

The admin page is available at `/admin`.

From the admin page, staff can edit every tutor's English and Chinese profile, add tutors, hide or restore tutors, manage one-on-one pricing rows, and update group-class prices. Changes only reach the public website after **Save changes** is clicked.

## Local-development sign-in

- Email: `operations@academyone.com.au` or `admin@academyone.com.au`
- Password: `admin`

## Vercel setup

The website uses Vercel Blob so saved changes are shared with every visitor.

1. In the Vercel project, open **Storage** and create a Blob store.
2. Connect the store to this project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
3. Redeploy the website.

Add these environment variables before deploying. Production login stays disabled until both `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are configured:

- `ADMIN_EMAILS`: optional comma-separated allowed email addresses (defaults to the two addresses above)
- `ADMIN_PASSWORD`: the admin password
- `ADMIN_SESSION_SECRET`: a long random string used to sign login sessions

Without a Blob store, local development saves to `data/content.json`; a Vercel deployment will refuse saves rather than pretend they succeeded.
