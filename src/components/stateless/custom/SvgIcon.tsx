import { Icon } from '@iconify/react';
import type { CSSProperties } from 'react';

interface IProps {
  readonly className?: string;
  /** Iconify icon name */
  readonly icon?: string;
  /** Local svg icon name */
  readonly localIcon?: string;
  readonly style?: CSSProperties;
}

const defaultLocalIcon = 'no-icon';

const { VITE_ICON_LOCAL_PREFIX: prefix } = import.meta.env;

const symbolId = (localIcon: string = defaultLocalIcon) => {
  const iconName = localIcon || defaultLocalIcon;

  return `#${prefix}-${iconName}`;
};

const SvgIcon = ({ icon, localIcon, ...props }: IProps) => {
  return localIcon || !icon ? (
    <svg
      height="1em"
      width="1em"
      {...props}
      aria-hidden="true"
    >
      <use
        fill="currentColor"
        href={symbolId(localIcon)}
      />
    </svg>
  ) : (
    <Icon
      icon={icon}
      {...props}
    />
  );
};

export default SvgIcon;
