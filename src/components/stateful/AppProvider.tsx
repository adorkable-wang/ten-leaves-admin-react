import { memo, type ReactNode } from "react";
import { App } from "antd";

function ContextHolder() {
  const { message, modal, notification } = App.useApp();
  window.$message = message;
  window.$modal = modal;
  window.$notification = notification;
  return null;
}

const AppProvider = memo(({ children }: { children: ReactNode }) => {
  return (
    <App className="h-full">
      <ContextHolder />
      {children}
    </App>
  );
});

export default AppProvider;
