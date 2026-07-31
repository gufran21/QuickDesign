name: Bug Report
description: Create a report to help us fix a bug
title: "[BUG] "
labels: ["bug"]
body:
  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      placeholder: A clear and concise description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps To Reproduce
      placeholder: |
        1. Open '.sysd' file
        2. Drag node X to position Y
        3. See error...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      placeholder: A clear description of what you expected to happen.
    validations:
      required: true
