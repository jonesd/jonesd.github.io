jonesd.github.io
================

Public website for https://dgjones.info as hosted on GitHub.

It is a mixture of HTML and also Jekyll generated content.

# Running locally with Jeykll

Run locally with:

    jeykll -w --safe serve

Run locally using docker:

    docker run --rm -v $(pwd):/srv/jekyll -p 127.0.0.1:4000:4000 jekyll/jekyll jekyll s --incremental

# Deploying to GitHub

Simply push the master/main branch to the "github" remote and the default GitHub action will process the contents of the repository root and generate the public website.

View the current and past deployment actions: https://github.com/jonesd/jonesd.github.io/deployments/activity_log?environment=github-pages