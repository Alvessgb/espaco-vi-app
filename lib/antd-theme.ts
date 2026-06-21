import type { ThemeConfig } from 'antd';

export const espacoViTheme: ThemeConfig = {
  token: {
    colorPrimary: '#5F4B3C',
    colorBgBase: '#F5EBE0',
    colorTextBase: '#3D2B1F',
    borderRadius: 12,
    fontFamily: '"Poppins", sans-serif',
    colorBorderSecondary: '#E0C5AC',
    colorFillSecondary: '#F5EBE0',
    colorSuccessText: '#4CAF50',
    colorErrorText: '#E53935',
  },
  components: {
    Button: {
      colorPrimary: '#5F4B3C',
      colorPrimaryHover: '#4a3a2d',
      borderRadius: 24,
      controlHeight: 48,
    },
    Input: {
      borderRadius: 12,
      colorBorder: '#E0C5AC',
    },
    Select: {
      borderRadius: 12,
      colorBorder: '#E0C5AC',
    },
    Card: {
      borderRadius: 16,
      colorBorderSecondary: '#E0C5AC',
    },
    Tabs: {
      inkBarColor: '#5F4B3C',
      itemActiveColor: '#5F4B3C',
      itemSelectedColor: '#5F4B3C',
      itemHoverColor: '#5F4B3C',
    },
    Calendar: {
      colorPrimary: '#5F4B3C',
      colorBgContainer: '#FFFFFF',
    },
    Modal: {
      borderRadius: 20,
    },
  },
};
