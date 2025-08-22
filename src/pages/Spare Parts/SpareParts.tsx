import React, { useEffect, useRef, useState } from "react";
import {
  createSparePart,
  createsparepartscategory,
  deleteSpareParts,
  getAllSpareParts,
  getAllsparepartscategory,
  updateSparePart,
  updatesparepartscategory,
} from "./Services/index";
import { FONTS } from "../../constants/constants";
import { EllipsisVertical } from "lucide-react";
import { IoMdClose } from "react-icons/io";
import { FiMoreVertical, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { FaRegEdit } from "react-icons/fa";

interface SparePart {
  stock: string | number | readonly string[] | undefined;
  productName: string | number | readonly string[] | undefined;
  _id: string;
  id: string;
  image: string;
  price: string;
  quantity: number;
  units: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  active?: boolean;
  warrantyPeriod: string;
  partnerId: string;
}

interface Category {
  _id: string;
  uuid: string;
  name: string;
  gstRate: number;
  __v: number;
}

const SpareParts: React.FC = () => {
  const [partsData, setPartsData] = useState<SparePart[]>([]);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

  const toggleMenu = (id: string) => {
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setShowEditCategoryModal(true);
    setMenuOpenId(null);
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory) return;
    try {
      const data: any = {
        uuid: currentCategory.uuid,
        name: currentCategory.name,
      };
      const response: any = await updatesparepartscategory(
        data,
        currentCategory.uuid
      );
      if (response) {
        toast.success("Category updated successfully!");
        fetchAllsparepartscategory();
        setShowEditCategoryModal(false);
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("Error updating category");
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await createsparepartscategory(newCategory);
      if (response) {
        setNewCategory({ name: "" });
        setShowAddCategoryModal(false);
        fetchAllsparepartscategory();
        toast.success("Category added successfully!");
      } else {
        toast.error("something wrong in add category");
      }
    } catch (error) {
      console.error("Failed to add category:", error);
      toast.error("Error adding category");
    }
  };

  const [newPart, setNewPart] = useState<
    Omit<SparePart, "id" | "inStock" | "reviews" | "rating" | "_id">
  >({
    productName: "",
    image: "",
    price: "0",
    quantity: 0,
    units: "",
    category: "",
    brand: "",
    active: true,
    warrantyPeriod: "",
    partnerId: "",
    stock: "",
  });

  const partner_id = localStorage.getItem("PartnerId") ?? "";

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response: any = await getAllSpareParts(partner_id);
        setPartsData(response.data.data);
      } catch (error) {
        console.error("Error fetching spare parts:", error);
      }
    };
    fetchParts();
    fetchAllsparepartscategory();
  }, [partner_id]);

  const addNewPart = async () => {
    try {
      const partData = {
        ...newPart,
        partnerId: partner_id,
      };
      const response: any = await createSparePart(partData);
      const createdPart = response.data.data;
      setPartsData((prev) => [...prev, createdPart]);
      resetAddForm();
      setShowAddForm(false);
      toast.success("Part added successfully");
    } catch (error) {
      console.error("Error creating spare part:", error);
    }
  };

  const deletePart = async (partId: string) => {
    try {
      await deleteSpareParts(partId);
      setPartsData((prev) => prev.filter((part) => part._id !== partId));
      setShowDeleteConfirm(false);
      setSelectedPart(null);
      toast.success("Part deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Fixed category filter function
  const filteredParts = partsData.filter((part) => {
    const matchesSearch = String(part.productName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? part.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const updatePart = async () => {
    if (!selectedPart) return;
    try {
      const updatedData = {
        productName: selectedPart.productName,
        price: selectedPart.price,
        brand: selectedPart.brand,
        image: selectedPart.image,
        stock: selectedPart.stock,
        inStock: selectedPart.inStock,
        category: selectedPart.category,
        warrantyPeriod: selectedPart.warrantyPeriod,
        quantity: selectedPart.quantity,
        active: selectedPart.active,
        reStockAuto: false,
      };
      await updateSparePart(updatedData, selectedPart._id);
      setPartsData((prev) =>
        prev.map((part) =>
          part._id === selectedPart._id ? selectedPart : part
        )
      );
      setEditForm(false);
      setSelectedPart(null);
      toast.success("update successfully");
    } catch (error) {
      console.error("Error updating spare part:", error);
    }
  };

  const [sparePartCategory, setSparePartCategory] = useState<Category[]>([]);

  const fetchAllsparepartscategory = async () => {
    const response: any = await getAllsparepartscategory();
    if (response) {
      setSparePartCategory(response?.data?.data);
    }
  };

  const resetAddForm = () => {
    setNewPart({
      productName: "",
      price: "0",
      image: "",
      brand: "",
      category: "",
      units: "",
      stock: "",
      partnerId: partner_id,
      warrantyPeriod: "",
      quantity: 0,
      active: true,
    });
    setShowAddForm(false);
  };

  const menuRef = useRef<HTMLDivElement | null>(null); // For tracking the menu DOM

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null); // Close the menu
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-7">
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-left" style={{ ...FONTS.header }}>
          Spare Parts
        </h1>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by product name..."
            className="border border-gray-300 rounded-full px-5 py-2 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-[#5d3c7b]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-[#9b111e] hover:text-red-600 transition-transform hover:scale-125"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <IoMdClose />
            </button>
          ) : (
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-gray-500" />
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className="mb-8 w-full bg-gray-100 rounded-xl shadow p-6 flex flex-col lg:flex-row items-center gap-6 hover:shadow-lg hover:scale-[1.01] transition-transform duration-300 ease-in-out">
        <div className="flex-1">
          <h2 className="" style={{ ...FONTS.header, fontSize: 24 }}>
            Explore Quality Spares at Auto Spare Hub
          </h2>
          <p className="mt-2" style={{ ...FONTS.cardSubHeader }}>
            Find reliable, high-quality auto spares at Auto Spare Hub—built for
            performance, priced for value.
          </p>
          <div className="flex gap-5">
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="mt-8 bg-[#7812A4] !text-white px-6 py-3 rounded-full  transition  flex items-center gap-2"
              style={{ ...FONTS.cardSubHeader, fontWeight: 600 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add category
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-8 bg-[#7812A4] !text-white px-6 py-3 rounded-full  transition  flex items-center gap-2"
              style={{ ...FONTS.cardSubHeader, fontWeight: 600 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add New Product
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="https://t4.ftcdn.net/jpg/05/21/93/17/360_F_521931702_TXOHZBa3tLVISome894Zc061ceab4Txm.jpg"
            alt="Spare Parts Overview"
            className="rounded-lg max-h-[250px] w-full object-cover shadow"
          />
        </div>
      </div>

      <div className="flex  justify-between mb-6">
        <h2 className=" text-left" style={{ ...FONTS.header, fontSize: 24 }}>
          Products
        </h2>
      </div>

      {/* Category Filter */}
      <div className="container px-4 py-2">
        <div className="flex pb-2 space-x-2">
          {/* Fixed 'All Categories' Button */}
          <div className="flex-none">
            <button
              onClick={() => {
                setMenuOpenId(null);
                setSelectedCategory(null);
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                !selectedCategory
                  ? "bg-[#7812A4] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Categories
            </button>
          </div>
          {/* Scrollable Category Buttons */}
          <div className="flex overflow-x-auto space-x-2 scrollbar-thin scrollbar-hide">
            {sparePartCategory.map((category) => (
              <div
                key={category._id}
                className="flex-none relative"
                ref={menuOpenId === category._id ? dropdownRef : null}
              >
                <button
                  onClick={() => {
                    if (selectedCategory !== category.name) {
                      setMenuOpenId(null);
                    }
                    setSelectedCategory(category.name);
                  }}
                  className={`relative px-4 py-2 rounded-full w-40 text-center whitespace-nowrap flex justify-center items-center ${
                    selectedCategory === category.name
                      ? "bg-[#7812A4] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span className="truncate">{category.name}</span>
                  {/* 3-dot icon only visible when selected */}
                  {selectedCategory === category.name && (
                    <span
                      className="ml-2 cursor-pointer absolute right-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(category._id);
                      }}
                    >
                      <FiMoreVertical />
                    </span>
                  )}
                </button>
                {/* Dropdown Menu */}
                {menuOpenId === category._id && (
                  <div
                    ref={menuRef}
                    className="absolute top-0 right-0 z-50 mt-1 bg-white border rounded shadow-md flex"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                      className="block w-full py-2 px-2 text-sm hover:bg-gray-100"
                    >
                      <FaRegEdit />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ">
          {filteredParts?.map((part, index) => {
            return (
              <div
                key={index}
                className="group relative border rounded-lg overflow-hidden shadow transition-transform duration-300 cursor-pointer bg-[white] hover:scale-105 hover:shadow-[0_0_10px_rgba(155,17,30,0.5)]"
                style={{ minHeight: "260px" }}
              >
                <div className="relative">
                  <button
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white rounded-3xl shadow-md transition-all duration-200"
                    aria-label="Quick view"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === part._id ? null : part._id);
                    }}
                  >
                    <EllipsisVertical className="w-4 h-4 text-black" />
                  </button>

                  {menuOpenId === part._id && (
                    <div className="absolute right-3 top-12 z-20 w-20 bg-white border border-gray-200 rounded-3xl shadow-lg">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-3xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Ensure all required properties exist
                          const safePart = {
                            ...part,
                            productName: part.productName || "",
                            price: part.price || "",
                            stock: part.stock || 0,
                            category: part.category || "",
                            brand: part.brand || "",
                            image: part.image || "",
                            warrantyPeriod: part.warrantyPeriod || "",
                            inStock:
                              part.inStock !== undefined ? part.inStock : true,
                          };
                          setSelectedPart(safePart);
                          setEditForm(true);
                          setMenuOpenId(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-[#7812A4] hover:bg-red-50 rounded-3xl"
                        onClick={() => {
                          setSelectedPart(part);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-[180px] flex justify-center items-center overflow-hidden rounded-md">
                  <img
                    src={part?.image}
                    alt={String(part?.productName)}
                    className="w-full h-full object-cover transition-all duration-300 ease-in-out"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="inline-block bg-gray-100 !text-gray-700 px-2 py-1 rounded-md text-xs font-medium"
                      style={{ ...FONTS.paragraph }}
                    >
                      {part.category}
                    </span>
                    <span
                      className="text-xs text-gray-500 font-medium"
                      style={{ ...FONTS.paragraph }}
                    >
                      {part.brand}
                    </span>
                  </div>

                  <h3 className="line-clamp-2" style={{ ...FONTS.cardheader }}>
                    {part?.productName}
                  </h3>
                  <div className="flex   justify-between">
                    <span
                      className="!text-xs  mb-3 p-1 !text-white rounded-md px-2 bg-green-600"
                      style={{ ...FONTS.paragraph }}
                    >
                      Quantity: {part.stock}
                    </span>
                    <span
                      className="!text-xs text-white"
                      style={{ ...FONTS.paragraph }}
                    >
                      Units: {part.units}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span
                      className="inline-block bg-blue-50 !text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
                      style={{ ...FONTS.paragraph }}
                    >
                      Warranty: {part.warrantyPeriod}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span
                      className="text-[#7812A4] font-bold"
                      style={{ ...FONTS.header, fontSize: 14 }}
                    >
                      ₹{part?.price?.toLocaleString() ?? "0"}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        part?.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-[#7812A4]"
                      }`}
                    >
                      {part?.inStock ? "IN STOCK" : "OUT OF STOCK"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 h-[350px]">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {selectedCategory
              ? `No products found in ${selectedCategory} category`
              : "No products found"}
          </h3>
        </div>
      )}

      {showAddCategoryModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddCategoryModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl font-bold !text-gray-900"
                  style={{ ...FONTS.header }}
                >
                  Add New Category
                </h2>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-3xl hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div
                className="grid grid-cols-1 gap-6 !text-gray-900"
                style={{ ...FONTS.paragraph }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="Enter category name"
                    required
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-3xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-6 py-2 bg-[#7812A4] hover:bg-[#7812A4] text-white rounded-3xl font-medium transition-colors"
                  disabled={!newCategory.name}
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && currentCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Category
                </h2>
                <button
                  onClick={() => setShowEditCategoryModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-3xl hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={currentCategory.name}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditCategoryModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-3xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-6 py-2 bg-[#7812A4]  text-white rounded-3xl font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Full Width Section */}
      <div className="w-full py-12 px-6 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 max-w-2xl lg:order-1">
          <h2 className=" mb-2" style={{ ...FONTS.header, fontSize: 24 }}>
            Precision Service & Support
          </h2>
          <p
            className="mb-6  leading-relaxed"
            style={{ ...FONTS.cardSubHeader }}
          >
            Delivering accurate repairs and dependable support to keep your
            vehicle running at its best. Our expert team ensures every detail is
            handled with care.Trust us for reliable service that gets you back
            on the road confidently.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <div
              className="bg-white px-4 py-2 rounded-full text-sm border shadow-sm"
              style={{ ...FONTS.cardSubHeader, fontSize: 14 }}
            >
              ✓ Expert Installation
            </div>
            <div
              className="bg-white px-4 py-2 rounded-full text-sm border shadow-sm"
              style={{ ...FONTS.cardSubHeader, fontSize: 14 }}
            >
              ✓ Quality Guarantee
            </div>
            <div
              className="bg-white px-4 py-2 rounded-full text-sm border shadow-sm"
              style={{ ...FONTS.cardSubHeader, fontSize: 14 }}
            >
              ✓ 24/7 Support
            </div>
          </div>
        </div>
        <div className="flex-1 lg:order-2">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Professional Auto Service"
            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => resetAddForm()}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => resetAddForm()}
              className="absolute top-2 right-2 text-3xl font-bold text-gray-600 "
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-6 ">Add New Product</h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 !text-gray-900"
              style={{ ...FONTS.paragraph }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.productName}
                  onChange={(e) =>
                    setNewPart({ ...newPart, productName: e.target.value })
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.image}
                  onChange={(e) =>
                    setNewPart({ ...newPart, image: e.target.value })
                  }
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)*
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.price || ""}
                  onChange={(e) =>
                    setNewPart({ ...newPart, price: e.target.value })
                  }
                  placeholder="Enter price"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity*
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.stock || ""}
                  onChange={(e) =>
                    setNewPart({
                      ...newPart,
                      stock: Number(e.target.value),
                    })
                  }
                  placeholder="Enter stock quantity"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units*
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.units}
                  onChange={(e) =>
                    setNewPart({ ...newPart, units: e.target.value })
                  }
                  required
                >
                  <option value="">Select Units</option>
                  <option>Ltr</option>
                  <option>Pcs</option>
                  <option>Kg</option>
                  <option>ml</option>
                  <option>M</option>
                  <option>Box</option>
                  <option>Bundle</option>
                  <option>packet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.category}
                  onChange={(e) =>
                    setNewPart({ ...newPart, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {sparePartCategory.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.brand}
                  onChange={(e) =>
                    setNewPart({ ...newPart, brand: e.target.value })
                  }
                  placeholder="Enter brand"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty Period*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newPart.warrantyPeriod}
                  onChange={(e) =>
                    setNewPart({ ...newPart, warrantyPeriod: e.target.value })
                  }
                  placeholder="e.g., 6 months"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={() => resetAddForm()}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={addNewPart}
                disabled={!String(newPart?.productName)?.trim()}
                className="px-6 py-2 bg-[#7812A4] text-white rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {selectedPart && editForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => {
            setEditForm(false);
            setSelectedPart(null);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setEditForm(false);
                setSelectedPart(null);
              }}
              className="absolute top-2 right-2 text-3xl font-bold text-gray-600 "
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-6 ">Edit Product</h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 !text-gray-900"
              style={{ ...FONTS.paragraph }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.productName || ""}
                  onChange={(e) =>
                    setSelectedPart({
                      ...selectedPart,
                      productName: e.target.value,
                    })
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.image || ""}
                  onChange={(e) =>
                    setSelectedPart({ ...selectedPart, image: e.target.value })
                  }
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)*
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.price || ""}
                  onChange={(e) =>
                    setSelectedPart({ ...selectedPart, price: e.target.value })
                  }
                  placeholder="Enter price"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity*
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.stock || ""}
                  onChange={(e) =>
                    setSelectedPart({
                      ...selectedPart,
                      stock: Number(e.target.value),
                      inStock: Number(e.target.value) > 0,
                    })
                  }
                  placeholder="Enter stock quantity"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units*
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.units || ""}
                  onChange={(e) =>
                    setSelectedPart({
                      ...selectedPart,
                      units: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Units</option>
                  <option>Ltr</option>
                  <option>Pcs</option>
                  <option>Kg</option>
                  <option>ml</option>
                  <option>M</option>
                  <option>Box</option>
                  <option>Bundle</option>
                  <option>packet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.category || ""}
                  onChange={(e) =>
                    setSelectedPart({
                      ...selectedPart,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {sparePartCategory.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.brand || ""}
                  onChange={(e) =>
                    setSelectedPart({ ...selectedPart, brand: e.target.value })
                  }
                  placeholder="Enter brand"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty Period*
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={selectedPart.warrantyPeriod || ""}
                  onChange={(e) =>
                    setSelectedPart({
                      ...selectedPart,
                      warrantyPeriod: e.target.value,
                    })
                  }
                  placeholder="e.g., 6 months"
                  required
                />
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    selectedPart.inStock ? "bg-green-500" : "bg-red-500"
                  }`}
                  onClick={() =>
                    setSelectedPart({
                      ...selectedPart,
                      inStock: !selectedPart.inStock,
                      stock: !selectedPart.inStock ? 1 : 0,
                    })
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      selectedPart.inStock ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="ml-2 text-sm text-gray-700">
                  {selectedPart.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={() => {
                  setEditForm(false);
                  setSelectedPart(null);
                }}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={updatePart}
                disabled={!String(selectedPart?.productName)?.trim()}
                className="px-6 py-2 bg-[#7812A4] text-white rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Product
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "
              <span className="font-medium">{selectedPart?.productName}</span>"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedPart) deletePart(selectedPart._id);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpareParts;
