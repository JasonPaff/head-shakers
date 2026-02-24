---
paths:
  - "**/*.tsx"
---

# Do not use forwardRef

This project uses React 19, where `forwardRef` is deprecated and no longer needed. In React 19, `ref` is a regular prop that can be passed directly to components.

## Instead of this:

```tsx
import { forwardRef } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
  return <input {...props} ref={ref} />;
});
```

## Do this:

```tsx
function MyInput({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}
```

Always accept `ref` as a destructured prop and pass it directly to the underlying element. Never wrap components with `forwardRef`.
