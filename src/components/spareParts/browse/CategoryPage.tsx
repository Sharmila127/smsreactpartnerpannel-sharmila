import { Link, useParams } from 'react-router-dom';
import { categories } from '../data/Product'
// import bgImg from '../../../assets/spareparts-img/checkout-bg_1_.png'
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const category = categories.find(cat => cat.id === categoryId);

  if (!category) return <div>Category not found</div>;

   const navigate = useNavigate();
    const fallBack = () => {
      navigate(-1);
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
  <IoMdArrowRoundBack 
    onClick={fallBack} 
    className="relative right-[-30px] top-[20px] text-3xl text-black cursor-pointer mb-4"
  />
  <div className="container mx-auto p-6">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{category.title}</h1>
      <p className="text-gray-600">Discover our premium collection</p>
    </div>
    
    {/* Products Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
      {category.items.map((product) => (
        <div 
          key={product.id}
          className="relative rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-[500px]"
        >
          {/* Full Background Image Only */}
          <div 
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ 
              backgroundImage: `url(${product.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Content Section */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-white/90 backdrop-blur-sm rounded-b-3xl">  
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-red-500 transition-colors">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500">Premium Quality</p>
              </div>
            </div>
            <Link 
              to={`/spare-parts/product/${product.id}`}
              className="group block"
            >
              <button className="w-full mt-6 bg-gradient-to-br from-[#700808] via-[#a61c1c] to-[#d23c3c] hover:from-red-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                View Details
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
    
    {/* Empty State */}
    {category.items.length === 0 && (
      <div className="text-center py-16">
        <div className="bg-white rounded-3xl p-12 shadow-lg max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-gray-600">This category is currently empty. Check back soon!</p>
        </div>
      </div>
    )}
  </div>
</div>
  );
}

export default CategoryPage;