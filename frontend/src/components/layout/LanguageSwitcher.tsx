import { CheckOutlined, GlobalOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { currentLang, LANGS, setLang } from '@/i18n';

/** Til almaştirgiç: UZ (standart) / RU / EN. Tanlov brauzerda saqlanadi, serverga `X-Lang` bilan yuboriladi */
export const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const active = currentLang();
  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        selectedKeys: [active],
        items: LANGS.map((code) => ({
          key: code,
          label: (
            <span className="flex items-center justify-between gap-6">
              {t(`lang.${code}`)}
              {code === active && <CheckOutlined className="text-primary" />}
            </span>
          ),
          onClick: () => setLang(code),
        })),
      }}
    >
      <Button type="text" icon={<GlobalOutlined />} aria-label={t('lang.label')} className="!px-2 !font-semibold uppercase">
        {active}
      </Button>
    </Dropdown>
  );
};
