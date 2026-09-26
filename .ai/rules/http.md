---
paths:
  - 'app/Http/**/*.php'
---

# Http

## Type hint route models in the controller or FormRequest authorize() gets a string
Implicit route-model binding is driven by the controller method signature, not by the route. A FormRequest that authorizes with `$this->route('run')` only receives a `Run` instance if the controller also type hints `Run $run`; drop the hint (because the body does not need it) and `$this->route('run')` stays the string "1", `Gate::can('update', '1')` finds no policy, and every request fails with 403 instead of a validation error. Keep the hint on any nested route whose parent is checked in a FormRequest, and note the reason in a PHPDoc line.
