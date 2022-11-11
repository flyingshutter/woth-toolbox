import styles from './PageContent.module.css';
import { PageContentProps } from './types';

export const PageContent = (props: PageContentProps) => {
  const { children } = props;

  return (
    <div className={styles.PageContent}>
      <div className={styles.PageContentBody}>{children}</div>
    </div>
  );
};
