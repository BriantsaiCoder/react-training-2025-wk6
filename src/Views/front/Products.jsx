import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    /**
     * 取得產品列表
     */
    const getProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/${API_PATH}/products`);
        // console.log(res.data.products);
        setProducts(res.data.products);
      } catch (error) {
        console.error('取得產品資料失敗', error);
      }
    };

    getProducts();
  }, []);

  const handleViewMore = (id) => {
    navigate(`/product/${id}`);
  };
  return (
    <>
      <div className='container mt-4'>
        <div className='row'>
          {products.map((product) => (
            <div className='col-md-4 mb-3 d-flex' key={product.id}>
              <div className='card h-100 w-100 product-card'>
                <div className='product-card-img-wrapper'>
                  <img src={product.imageUrl} className='product-card-image' alt={product.title} />
                </div>
                <div className='card-body product-card-body'>
                  <h5 className='card-title'>{product.title}</h5>
                  <p className='card-text'>{product.description}</p>
                  <p className='card-text'>
                    <strong>價格:</strong> {product.price} 元
                  </p>
                  <p className='card-text'>
                    <small className='text-muted'>單位: {product.unit}</small>
                  </p>
                  <button className='btn btn-primary mt-auto' onClick={() => handleViewMore(product.id)}>
                    查看更多
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Products;
