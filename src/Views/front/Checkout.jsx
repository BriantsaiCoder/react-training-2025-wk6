import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { currency } from '../../Utils/filter';
import { emailRules, nameRules, telRules, addressRules } from '../../Utils/checkoutValidation';
import { useForm } from 'react-hook-form';
import { RotatingLines } from 'react-loader-spinner';
import * as bootstrap from 'bootstrap';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
import ProductModal from '../../Components/ProductModal';
import SingleProductModal from '../../Components/SingleProductModal';

function Checkout() {
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const ProductModalRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  // 更新商品數量
  const updateCart = async (cartId, productId, qty = 1) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${cartId}`;

      const data = {
        product_id: productId,
        qty,
      };
      await axios.put(url, { data });
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };
  // 取得購物車列表
  const getCart = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      const response = await axios.get(url);
      setCart(response.data.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 清除單一筆購物車
  const deleteCart = async (cartId) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${cartId}`;
      await axios.delete(url);
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };
  // 清空購物車
  const deleteCartAll = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/carts`;
      await axios.delete(url);
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };
  // 取得產品列表
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/products`);
      // console.log(res.data.products);
      setProducts(res.data.products);
    } catch (error) {
      console.error('取得產品資料失敗', error);
    }
  };
  //取得單一產品資料
  const handleSingleProductOverview = async (id) => {
    setLoadingProductId(id);
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
      setProduct(res.data.product);
      // console.log(res.data.product);
    } catch (error) {
      console.error('取得產品資料失敗', error);
    } finally {
      setLoadingProductId(null);
    }
    ProductModalRef.current.show();
  };
  const closeProductModal = () => {
    ProductModalRef.current.hide();
  };
  // 加入購物車
  const addCart = async (id, num) => {
    setLoadingCartId(id);
    const data = {
      product_id: id,
      qty: num,
    };
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      const res = await axios.post(url, { data });
      console.log(res.data);
      getCart();
    } catch (error) {
      console.log(error.response.data);
    } finally {
      setLoadingCartId(null);
    }
  };
  useEffect(() => {
    getProducts();
    getCart();
    ((ProductModalRef.current = new bootstrap.Modal('#productModal')),
      {
        keyboard: false,
      });
    // Modal 關閉時移除焦點
    document.querySelector('#productModal').addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }, []);

  // 訂單送出
  const handleOrder = async (formData) => {
    // console.log('訂單資料:', formData);
    try {
      const url = `${API_BASE}/api/${API_PATH}/order`;
      const data = {
        user: formData,
        message: formData.message,
      };
      const response = await axios.post(url, { data });
      console.log('訂單回應:', response.data);
      getCart();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // src/views/front/Checkout.jsx
    <div className='container'>
      {/* 產品列表 */}
      <table className='table align-middle'>
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product) => (
            <tr key={product.id}>
              <td style={{ width: '200px' }}>
                <div
                  style={{
                    height: '100px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${product.imageUrl})`,
                  }}
                ></div>
              </td>
              <td>{product.title}</td>
              <td>
                <del className='h6'>原價：{currency(product.origin_price)}</del>
                <div className='h5'>特價：{currency(product.price)}</div>
              </td>
              <td>
                <div className='btn-group btn-group-sm'>
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    onClick={() => handleSingleProductOverview(product.id)}
                    disabled={loadingProductId === product.id}
                  >
                    {loadingProductId === product.id ? (
                      <div className='text-center'>
                        <RotatingLines color='grey' width={80} height={16} />
                      </div>
                    ) : (
                      '查看更多'
                    )}
                  </button>
                  <button
                    type='button'
                    className='btn btn-outline-danger'
                    onClick={() => addCart(product.id, 1)}
                    disabled={loadingCartId === product.id}
                  >
                    {loadingCartId === product.id ? (
                      <div className='text-center'>
                        <RotatingLines color='grey' width={80} height={16} />
                      </div>
                    ) : (
                      '加到購物車'
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>購物車列表</h2>
      <div className='text-end mt-4'>
        <button type='button' className='btn btn-outline-danger' onClick={() => deleteCartAll()}>
          清空購物車
        </button>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th scope='col'></th>
            <th scope='col'>品名</th>
            <th scope='col'>數量/單位</th>
            <th scope='col'>小計</th>
          </tr>
        </thead>
        <tbody>
          {cart?.carts?.map((cartItem) => (
            <tr key={cartItem.id}>
              <td>
                <button type='button' className='btn btn-outline-danger btn-sm' onClick={() => deleteCart(cartItem.id)}>
                  刪除
                </button>
              </td>
              <th scope='row'>{cartItem.product.title}</th>
              <td>
                <div className='input-group input-group-sm mb-3'>
                  <input
                    type='number'
                    className='form-control'
                    aria-label='Sizing example input'
                    aria-describedby='inputGroup-sizing-sm'
                    value={cartItem.qty}
                    onChange={(e) => updateCart(cartItem.id, cartItem.product_id, Number(e.target.value))}
                  />
                  <span className='input-group-text' id='inputGroup-sizing-sm'>
                    {cartItem.product.unit}
                  </span>
                </div>
              </td>
              <td className='text-end'>{currency(cartItem.final_total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className='text-end' colSpan='3'>
              總計
            </td>
            <td className='text-end'>{currency(cart.final_total)}</td>
          </tr>
        </tfoot>
      </table>
      {/* 結帳頁面 */}
      <div className='my-5 row justify-content-center'>
        <form className='col-md-6' onSubmit={handleSubmit(handleOrder)}>
          <div className='mb-3'>
            <label htmlFor='email' className='form-label'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              className='form-control'
              placeholder='例:user@example.com'
              defaultValue='test@gmail.com'
              {...register('email', emailRules)}
            />
            {errors.email && <p className='text-danger'>{errors.email.message}</p>}
          </div>

          <div className='mb-3'>
            <label htmlFor='name' className='form-label'>
              收件人姓名
            </label>
            <input
              id='name'
              name='name'
              type='text'
              className='form-control'
              placeholder='例:王小明'
              defaultValue='test'
              {...register('name', nameRules)}
            />
            {errors.name && <p className='text-danger'>{errors.name.message}</p>}
          </div>

          <div className='mb-3'>
            <label htmlFor='tel' className='form-label'>
              收件人電話
            </label>
            <input
              id='tel'
              name='tel'
              type='tel'
              className='form-control'
              placeholder='例:0912345678'
              defaultValue='0912346768'
              {...register('tel', telRules)}
            />
            {errors.tel && <p className='text-danger'>{errors.tel.message}</p>}
          </div>

          <div className='mb-3'>
            <label htmlFor='address' className='form-label'>
              收件人地址
            </label>
            <input
              id='address'
              name='address'
              type='text'
              className='form-control'
              placeholder='例:臺北市信義區信義路五段7號'
              defaultValue='kaohsiung'
              {...register('address', addressRules)}
            />
            {errors.address && <p className='text-danger'>{errors.address.message}</p>}
          </div>

          <div className='mb-3'>
            <label htmlFor='message' className='form-label'>
              留言
            </label>
            <textarea id='message' className='form-control' cols='30' rows='10' {...register('message')}></textarea>
          </div>
          <div className='text-end'>
            <button type='submit' className='btn btn-danger'>
              送出訂單
            </button>
          </div>
        </form>
      </div>
      <SingleProductModal product={product} addCart={addCart} closeModal={closeProductModal} />
    </div>
  );
}

export default Checkout;
