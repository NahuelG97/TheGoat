import React, { useEffect, useState } from 'react';
import {
  getProducts,
  getIngredients,
  getProduct,
  addIngredientToRecipe,
  removeIngredientFromRecipe,
  Product,
  Ingredient,
} from '../services/api';

const RecipeEditor: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, ingredientsRes] = await Promise.all([
        getProducts(),
        getIngredients(),
      ]);
      setProducts(productsRes.data);
      setIngredients(ingredientsRes.data);
    } catch (err) {
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (productId: number) => {
    try {
      setSelectedProductId(productId);
      setLoading(true);
      const response = await getProduct(productId);
      setSelectedProduct(response.data);
      setSelectedIngredientId(null);
      setQuantity('');
    } catch (err) {
      setError('Error cargando producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedIngredientId || !quantity) {
      setError('Complete todos los campos');
      return;
    }

    try {
      await addIngredientToRecipe(selectedProductId, selectedIngredientId, parseFloat(quantity));
      setQuantity('');
      setSelectedIngredientId(null);
      await handleSelectProduct(selectedProductId);
    } catch (err) {
      setError('Error agregando ingrediente');
    }
  };

  const handleRemoveIngredient = async (ingredientId: number) => {
    if (!selectedProductId) return;

    try {
      await removeIngredientFromRecipe(selectedProductId, ingredientId);
      await handleSelectProduct(selectedProductId);
    } catch (err) {
      setError('Error removiendo ingrediente');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Editor de Recetas</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Producto</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <button
                key={product.Id}
                onClick={() => handleSelectProduct(product.Id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  selectedProductId === product.Id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{product.Name}</div>
                <div className="text-sm text-gray-600">ID: {product.Id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Receta actual */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receta Actual</h3>
          {selectedProduct ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedProduct.Name}</h4>
                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {selectedProduct.ingredients.map((ingredient) => (
                      <div
                        key={ingredient.Id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{ingredient.Name}</p>
                          <p className="text-sm text-gray-600">
                            {ingredient.Quantity} {ingredient.Unit} @ ${ingredient.CostPerUnit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveIngredient(ingredient.IngredientId)}
                          className="ml-2 text-red-600 hover:text-red-900 font-medium text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm mt-2">Sin ingredientes</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Selecciona un producto</p>
          )}
        </div>
      </div>

      {/* Agregar ingrediente */}
      {selectedProductId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Ingrediente</h3>
          <form onSubmit={handleAddIngredient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingrediente</label>
                <select
                  value={selectedIngredientId || ''}
                  onChange={(e) => setSelectedIngredientId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Selecciona un ingrediente</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.Id} value={ingredient.Id}>
                      {ingredient.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Agregar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecipeEditor;
