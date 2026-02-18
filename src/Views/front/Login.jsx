import { useNavigate } from 'react-router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { usernameRules, passwordRules } from '../../Utils/loginValidation';

const API_BASE = import.meta.env.VITE_API_BASE;

function Login() {
  const navigate = useNavigate();

  // const [formData, setFormData] = useState({
  //   username: '',
  //   password: '',
  // });
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };

  const onSubmit = async (formData) => {
    // e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log('登入成功:', response.data);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common['Authorization'] = token;
      navigate('/');
    } catch (error) {
      console.error('登入失敗:', error.response);
      alert('登入失敗，請確認帳號密碼是否正確');
    }
  };

  return (
    <div className='container login'>
      <div className='row justify-content-center'>
        <h1 className='h3 mb-3 font-weight-normal'>請先登入</h1>
        <div className='col-8'>
          <form id='form' className='form-signin' onSubmit={handleSubmit(onSubmit)}>
            <div className='form-floating mb-3'>
              <input
                type='email'
                className='form-control'
                name='username'
                placeholder='name@example.com'
                {...register('username', usernameRules)}
                // value={formData.username}
                // onChange={(e) => handleInputChange(e)}
                // required
                autoFocus
              />
              {errors.username && <p className='text-danger'>{errors.username.message}</p>}
              <label htmlFor='username'>Email address</label>
            </div>
            <div className='form-floating'>
              <input
                type='password'
                className='form-control'
                name='password'
                placeholder='Password'
                {...register('password', passwordRules)}
                // value={formData.password}
                // onChange={(e) => handleInputChange(e)}
                // required
              />
              {errors.password && <p className='text-danger'>{errors.password.message}</p>}
              <label htmlFor='password'>Password</label>
            </div>
            <button className='btn btn-lg btn-primary w-100 mt-3' type='submit'>
              登入
            </button>
          </form>
        </div>
      </div>
      <p className='mt-5 mb-3 text-muted'>&copy; 2026~∞ - 六角學院</p>
    </div>
  );
}
export default Login;
