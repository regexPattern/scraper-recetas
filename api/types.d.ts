export type Recipe = {
	metaTags: RecipeMetaTag[];
	img?: RecipeImg;
	ingredients: RecipeImg[];
	steps: RecipeStep[];
};

type RecipeMetaTag = string;

type RecipeImg = string;

type RecipeIngredient = string;

type RecipeStep = string;

export type Scraper = (document: Document) => Recipe;
