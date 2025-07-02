import { MDXProvider } from '@mdx-js/react';

import { Anchor, Layout, Menu } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { sceneMenuItems } from '@/configs/sceneMenu';

import './index.module.less';

const { Sider, Content } = Layout;

interface SceneLayoutProps {
  children: ReactNode;
}

interface AnchorItem {
  key: string;
  href: string;
  title: string;
  children?: AnchorItem[];
}

const SceneLayout = ({ children }: SceneLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorItems, setAnchorItems] = useState<AnchorItem[]>([]);

  // 根据当前路由获取选中的菜单项
  const selectedKey = location.pathname;

  // 内置的菜单点击处理逻辑
  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  // 提取页面中的标题生成锚点
  useEffect(() => {
    const extractHeadings = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const items: AnchorItem[] = [];

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent || '';
        const id = `heading-${index}-${text.replace(/\s+/g, '-').toLowerCase()}`;

        // 为标题添加id，用于锚点跳转
        heading.id = id;

        const item: AnchorItem = {
          key: id,
          href: `#${id}`,
          title: text,
        };

        if (level === 1) {
          items.push(item);
        } else if (level === 2) {
          const lastH1 = items[items.length - 1];
          if (lastH1) {
            if (!lastH1.children) lastH1.children = [];
            lastH1.children.push(item);
          } else {
            items.push(item);
          }
        } else if (level === 3) {
          const lastH1 = items[items.length - 1];
          if (lastH1 && lastH1.children) {
            const lastH2 = lastH1.children[lastH1.children.length - 1];
            if (lastH2) {
              if (!lastH2.children) lastH2.children = [];
              lastH2.children.push(item);
            } else {
              lastH1.children.push(item);
            }
          } else if (lastH1) {
            if (!lastH1.children) lastH1.children = [];
            lastH1.children.push(item);
          } else {
            items.push(item);
          }
        }
      });

      setAnchorItems(items);
    };

    // 延迟执行，确保MDX内容已渲染
    const timer = setTimeout(extractHeadings, 100);

    return () => clearTimeout(timer);
  }, [children, location.pathname]);

  // 自定义MDX组件，为标题添加样式
  const components = {
    h1: (props: any) => <h1 style={{ marginTop: '2em', marginBottom: '1em' }} {...props} />,
    h2: (props: any) => <h2 style={{ marginTop: '1.5em', marginBottom: '0.8em' }} {...props} />,
    h3: (props: any) => <h3 style={{ marginTop: '1.2em', marginBottom: '0.6em' }} {...props} />,
  };

  return (
    <Layout style={{ height: '100%' }}>
      <Layout
        style={{ minHeight: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}
      >
        <Sider
          width="18vw"
          style={{
            paddingTop: '24px',
            minHeight: '100%',
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            textAlign: 'left',
          }}
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={sceneMenuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </Sider>
        <Content
          style={{
            padding: '24px',
            paddingInline: '48px 200px',
            paddingBottom: '100px',
            minHeight: 280,
            overflow: 'scroll',
            position: 'relative',
          }}
        >
          <MDXProvider components={components}>{children}</MDXProvider>

          {/* 右侧锚点导航 */}
          {anchorItems.length > 0 && (
            <div
              style={{
                position: 'fixed',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '160px',
                maxHeight: '60vh',
                overflow: 'auto',
                background: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                padding: '16px 0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  padding: '0 16px 8px',
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: '8px',
                }}
              >
                目录
              </div>
              <Anchor
                items={anchorItems}
                offsetTop={80}
                bounds={5}
                style={{
                  fontSize: '12px',
                }}
                getContainer={() =>
                  (document.querySelector('.ant-layout-content') || window) as any
                }
              />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SceneLayout;
