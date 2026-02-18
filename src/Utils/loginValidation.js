// React Hook Form 登入表單驗證規則
import { emailRules } from './checkoutValidation';

export const usernameRules = emailRules;

export const passwordRules = {
  required: '請輸入密碼',
  minLength: {
    value: 6,
    message: '密碼長度至少需 6 碼',
  },
};
