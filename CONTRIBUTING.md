# Welcome to CookieConsent contributing guide

Thank you for investing your time in contributing to this project!

## Documentation

Documentation is available in [cookieconsent/docs](/docs/).

## Getting Started

### Issues

If you encountered a problem, [search if an issue already exists](https://github.com/orestbida/cookieconsent/issues). If no related issues are found, you can [open a new issue via the appropriate issue template](https://github.com/orestbida/cookieconsent/issues/new/choose).

### Make Changes

0. #### Prerequisites

    1. You need to have [node.js LTS](https://nodejs.org/en/download/) installed to test your changes and create the bundled version of the source code.

    2. This project uses `pnpm` to manage the dependencies, which you can install via:
        ```bash
        npm i -g pnpm
        ```

    3. Follow the [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/overview/getting-started-with-github-desktop) guide.

1. #### Make changes locally

    1. [Fork and clone the repository](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop).

    2. [Create a new working branch](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository).

    3. Go to the root of the repo and install all dependencies via:

        ```
        pnpm install
        ```

    4. Make the changes, to see your local changes in action, run:

        ```
        pnpm dev
        ```

        Note: If you're making changes to the documentation, use `pnpm docs:dev`.

    5. Once you've finished, generate the bundled version via:

        ```
        pnpm build
        ```
    6. Make sure tests are all green:

        ```
        pnpm test
        ```

3. Push the changes and [create a Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

### Pull Request (PR)

1. When creating a new PR, explain briefly what it improves/fixes so that we can easily understand your changes.
2. Don't forget to [link existing issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue), if you're solving one.
3. Enable the [allow maintainer edits](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork) checkbox so that the branch can be updated for a merge.
4. We may ask questions or require changes before a PR is merged.
5. If everything is clear and sorted out, your PR will be merged! Congratulations 🎉!

#### Note: feature requests

Before creating a feature requests, make sure you "are on the same page" as the maintainer, so that your efforts don't get rejected! A feature request might be rejected if there is no  related issue/discussion.

## Thanks!

Once your PR is merged, your contribution will be available in the next release!

## Questions?

If you have any questions, feel free to [open a new discussion](https://github.com/orestbida/cookieconsent/discussions/new/choose)!