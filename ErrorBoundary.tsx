import { useRouteError, useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import type { FC } from "react";
import { $t } from "./src/locales";

import type { FallbackProps } from "react-error-boundary";
import { localStg } from "@/utils/storage";
import SvgIcon from "@/components/stateless/custom/SvgIcon";

const { Title, Text } = Typography;

type Props = Partial<FallbackProps>;

const isDev = import.meta.env.DEV;

const theme = localStg.get("themeColor") || "#646cff";

const HookedErrorHandler = () => {
  const navigate = useNavigate();
  const error = useRouteError() as Error;

  const handleRefresh = () => {
    navigate(0);
  };

  return (
    <>
      <Text code>{error?.message || $t("common.errorHint")}</Text>
      <Button
        style={{ backgroundColor: theme }}
        type="primary"
        onClick={handleRefresh}
      >
        {$t("common.tryAlign")}
      </Button>
    </>
  );
};

const ErrorPage: FC<Props> = ({ error, resetErrorBoundary }) => {
  const isRouterContext = !!window.location?.pathname; // 简单判断是否处于路由环境

  return (
    <div className="size-full min-h-520px flex-col-center gap-16px overflow-hidden">
      <div className="flex text-400px text-primary">
        <SvgIcon localIcon="error" />
      </div>

      {isDev ? (
        isRouterContext ? (
          <HookedErrorHandler />
        ) : (
          <>
            <Text code>{error?.message || $t("common.errorHint")}</Text>
            <Button
              style={{ backgroundColor: theme }}
              type="primary"
              onClick={resetErrorBoundary}
            >
              {$t("common.tryAlign")}
            </Button>
          </>
        )
      ) : (
        <>
          <Title level={3}>{$t("common.errorHint")}</Title>
          <Button
            style={{ backgroundColor: theme }}
            type="primary"
            onClick={resetErrorBoundary}
          >
            {$t("common.tryAlign")}
          </Button>
        </>
      )}
    </div>
  );
};

export default ErrorPage;
