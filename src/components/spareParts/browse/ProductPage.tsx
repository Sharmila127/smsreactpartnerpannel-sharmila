import { useNavigate, useParams } from 'react-router-dom';
import { categories } from '../data/Product';
import { IoMdArrowRoundBack } from "react-icons/io";


const ProductPage = () => {
  const { productId } = useParams();

  const navigate = useNavigate();
  const fallBack = () => {
    navigate(-1);
  }
 
  // Find the product in any category
  let product = null;
  for (const category of categories) {
    product = category.items.find(item => item.id === productId);
    if (product) break;
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto p-6">
      <IoMdArrowRoundBack 
      onClick={fallBack} 
      className=" relative right-[10px] text-3xl text-black  cursor-pointer mb-4"
      />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/5">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full rounded-lg"
          />
        </div>
        <div className="md:w-2/5">
          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl text-red-600 font-semibold mb-4">{product.price}</p>
          <p className="mb-6">{product.description}</p>
          
          <h2 className="text-lg font-semibold mb-2">Specifications:</h2>
          <ul className="mb-6">
            {product.specs.map((spec, index) => (
              <li key={index} className="mb-1">• {spec}</li>
            ))}
          </ul>

        </div>
      </div>
    </div>
  );
}

export default ProductPage;