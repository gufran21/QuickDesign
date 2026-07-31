name: Feature Request
description: Suggest an idea or feature for QuickDesign
title: "[FEAT] "
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      placeholder: A clear description of what the problem is.
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      placeholder: Describe the solution you'd like to see.
    validations:
      required: true
