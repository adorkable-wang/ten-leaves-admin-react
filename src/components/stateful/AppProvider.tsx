import { App } from 'antd';
import { type ReactNode, memo } from 'react';

function ContextHolder() {
  const { message, modal, notification } = App.useApp();
  window.$message = message;
  window.$modal = modal;
  window.$notification = notification;
  return null;
}

const AppProvider = memo(({ children }: { readonly children: ReactNode }) => {
  return (
    <App className="h-full">
      <ContextHolder />
      {children}
    </App>
  );
});

export default AppProvider;
