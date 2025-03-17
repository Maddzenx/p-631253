
import React, { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { useMealPlan } from "@/hooks/useMealPlan";
import { RecipeHeader } from "@/components/recipe-detail/RecipeHeader";
import { RecipeMetrics } from "@/components/recipe-detail/RecipeMetrics";
import { RecipeActions } from "@/components/recipe-detail/RecipeActions";
import { RecipeTabs } from "@/components/recipe-detail/RecipeTabs";
import { RecipeError } from "@/components/recipe-detail/RecipeError";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { BottomNav } from "@/components/BottomNav";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { navItems, handleProductQuantityChange } = useNavigationState();
  const { toggleFavorite, favoriteIds, mealPlan, addToMealPlan } = useMealPlan();
  
  const {
    recipe,
    isLoading,
    error,
    activeTab,
    setActiveTab,
  } = useRecipeDetail(id);

  // Handle back button click
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle navigation selection
  const handleNavSelect = (id: string) => {
    navigate(`/${id}`);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  }, [recipe, toggleFavorite]);

  // Handle adding to meal plan
  const handleAddToMealPlanDay = useCallback((day: string, recipeId: string) => {
    addToMealPlan(day, recipeId);
  }, [addToMealPlan]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (recipe && recipe.matchedProducts && recipe.matchedProducts.length > 0) {
      recipe.matchedProducts.forEach((product) => {
        handleProductQuantityChange(
          product.id,
          1,
          0,
          {
            name: product.name,
            details: product.details,
            price: product.currentPrice,
            image: product.image,
            store: product.store,
            recipeId: recipe.id,
            recipeTitle: recipe.title
          }
        );
      });
    }
  }, [recipe, handleProductQuantityChange]);

  // Auto scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-20 flex flex-col items-center justify-center">
        <LoadingIndicator message="Laddar recept..." />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <RecipeError
        message={error?.message}
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <RecipeHeader 
        title={recipe.title}
        imageUrl={recipe.image_url}
        onGoBack={handleGoBack}
      />
      
      <RecipeMetrics 
        timeMinutes={recipe.time_minutes}
        servings={recipe.servings}
        difficulty={recipe.difficulty}
        tags={recipe.tags}
      />
      
      <RecipeActions 
        recipe={recipe}
        favoriteIds={favoriteIds}
        mealPlan={mealPlan}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToMealPlan={handleAddToMealPlanDay}
      />
      
      <RecipeTabs 
        recipe={recipe}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddToCart={handleAddToCart}
      />
      
      <BottomNav items={navItems} onSelect={handleNavSelect} />
    </div>
  );
};

export default RecipeDetail;
