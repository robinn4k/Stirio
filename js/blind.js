// Blind Tasting mode: aroma/flavor description → guess the spirit
import { shuffle } from './utils.js';

export const SPIRITS = [
  {
    name: { es: 'Whisky Escocés (Islay)', en: 'Islay Scotch Whisky', fr: 'Whisky Écossais (Islay)', pt: 'Whisky Escocês (Islay)', de: 'Islay Scotch Whisky' },
    clues: [
      { es: 'Intenso ahumado y turba', en: 'Intense smokiness and peat', fr: 'Fumée intense et tourbe', pt: 'Defumado intenso e turfa', de: 'Intensive Rauchigkeit und Torf' },
      { es: 'Notas de alga marina y yodo', en: 'Notes of seaweed and iodine', fr: 'Notes d\'algues marines et d\'iode', pt: 'Notas de alga marinha e iodo', de: 'Noten von Meeresalgen und Jod' },
      { es: 'Finish largo y medicinal', en: 'Long, medicinal finish', fr: 'Finale longue et médicinale', pt: 'Final longo e medicinal', de: 'Langer, medizinischer Abgang' },
      { es: 'Elaborado en una isla escocesa', en: 'Made on a Scottish island', fr: 'Élaboré sur une île écossaise', pt: 'Produzido em uma ilha escocesa', de: 'Auf einer schottischen Insel hergestellt' },
    ],
    answers: [
      { es: 'Whisky Escocés (Islay)', en: 'Islay Scotch Whisky', fr: 'Whisky Écossais (Islay)', pt: 'Whisky Escocês (Islay)', de: 'Islay Scotch Whisky' },
      { es: 'Mezcal', en: 'Mezcal', fr: 'Mezcal', pt: 'Mezcal', de: 'Mezcal' },
      { es: 'Calvados', en: 'Calvados', fr: 'Calvados', pt: 'Calvados', de: 'Calvados' },
      { es: 'Armagnac', en: 'Armagnac', fr: 'Armagnac', pt: 'Armagnac', de: 'Armagnac' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Tequila Blanco', en: 'Blanco Tequila', fr: 'Tequila Blanco', pt: 'Tequila Blanco', de: 'Blanco Tequila' },
    clues: [
      { es: 'Agave crudo y vegetal', en: 'Raw and vegetal agave', fr: 'Agave cru et végétal', pt: 'Agave cru e vegetal', de: 'Rohe und pflanzliche Agave' },
      { es: 'Notas cítricas y pimienta blanca', en: 'Citrus notes and white pepper', fr: 'Notes d\'agrumes et poivre blanc', pt: 'Notas cítricas e pimenta branca', de: 'Zitrusnoten und weißer Pfeffer' },
      { es: 'Ligero toque de flores silvestres', en: 'Light touch of wildflowers', fr: 'Légère touche de fleurs sauvages', pt: 'Leve toque de flores silvestres', de: 'Leichter Hauch von Wildblumen' },
      { es: 'Destilado de planta suculenta azul', en: 'Distilled from blue succulent plant', fr: 'Distillé à partir de plante succulente bleue', pt: 'Destilado de planta suculenta azul', de: 'Aus blauer Sukkulente destilliert' },
    ],
    answers: [
      { es: 'Tequila Blanco', en: 'Blanco Tequila', fr: 'Tequila Blanco', pt: 'Tequila Blanco', de: 'Blanco Tequila' },
      { es: 'Ginebra', en: 'Gin', fr: 'Gin', pt: 'Gin', de: 'Gin' },
      { es: 'Vodka de Agave', en: 'Agave Vodka', fr: 'Vodka d\'Agave', pt: 'Vodka de Agave', de: 'Agave-Wodka' },
      { es: 'Mezcal Joven', en: 'Young Mezcal', fr: 'Mezcal Joven', pt: 'Mezcal Joven', de: 'Junger Mezcal' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Mezcal', en: 'Mezcal', fr: 'Mezcal', pt: 'Mezcal', de: 'Mezcal' },
    clues: [
      { es: 'Ahumado de leña, suave y complejo', en: 'Wood-smoked, smooth and complex', fr: 'Fumé au bois, doux et complexe', pt: 'Defumado em lenha, suave e complexo', de: 'Holzrauch, weich und komplex' },
      { es: 'Frutas tropicales y tierra', en: 'Tropical fruits and earth', fr: 'Fruits tropicaux et terre', pt: 'Frutas tropicais e terra', de: 'Tropische Früchte und Erde' },
      { es: 'Elaborado con agave silvestre', en: 'Made with wild agave', fr: 'Élaboré avec de l\'agave sauvage', pt: 'Elaborado com agave silvestre', de: 'Hergestellt mit wilder Agave' },
      { es: 'Notas de chocolate y café', en: 'Notes of chocolate and coffee', fr: 'Notes de chocolat et café', pt: 'Notas de chocolate e café', de: 'Noten von Schokolade und Kaffee' },
    ],
    answers: [
      { es: 'Mezcal', en: 'Mezcal', fr: 'Mezcal', pt: 'Mezcal', de: 'Mezcal' },
      { es: 'Tequila Reposado', en: 'Reposado Tequila', fr: 'Tequila Reposado', pt: 'Tequila Reposado', de: 'Reposado Tequila' },
      { es: 'Whisky de Tennessee', en: 'Tennessee Whiskey', fr: 'Whisky du Tennessee', pt: 'Whisky de Tennessee', de: 'Tennessee Whiskey' },
      { es: 'Ron Añejo', en: 'Aged Rum', fr: 'Rhum Vieux', pt: 'Rum Envelhecido', de: 'Gealterter Rum' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Cognac VSOP', en: 'Cognac VSOP', fr: 'Cognac VSOP', pt: 'Cognac VSOP', de: 'Cognac VSOP' },
    clues: [
      { es: 'Flores secas y vainilla', en: 'Dried flowers and vanilla', fr: 'Fleurs séchées et vanille', pt: 'Flores secas e baunilha', de: 'Trockenblumen und Vanille' },
      { es: 'Ciruela pasa y higos', en: 'Prunes and figs', fr: 'Pruneaux et figues', pt: 'Ameixa seca e figos', de: 'Backpflaumen und Feigen' },
      { es: 'Notas de roble francés y canela', en: 'French oak and cinnamon notes', fr: 'Notes de chêne français et cannelle', pt: 'Notas de carvalho francês e canela', de: 'Noten von französischer Eiche und Zimt' },
      { es: 'Envejecido mínimo 4 años en barrica', en: 'Aged at least 4 years in barrel', fr: 'Vieilli au moins 4 ans en fût', pt: 'Envelhecido no mínimo 4 anos em barril', de: 'Mindestens 4 Jahre im Fass gereift' },
    ],
    answers: [
      { es: 'Cognac VSOP', en: 'Cognac VSOP', fr: 'Cognac VSOP', pt: 'Cognac VSOP', de: 'Cognac VSOP' },
      { es: 'Armagnac Joven', en: 'Young Armagnac', fr: 'Armagnac Jeune', pt: 'Armagnac Jovem', de: 'Junger Armagnac' },
      { es: 'Calvados', en: 'Calvados', fr: 'Calvados', pt: 'Calvados', de: 'Calvados' },
      { es: 'Ron Añejo', en: 'Aged Rum', fr: 'Rhum Vieux', pt: 'Rum Envelhecido', de: 'Gealterter Rum' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Ginebra London Dry', en: 'London Dry Gin', fr: 'Gin London Dry', pt: 'Gin London Dry', de: 'London Dry Gin' },
    clues: [
      { es: 'Enebro fresco y dominante', en: 'Fresh and dominant juniper', fr: 'Genévrier frais et dominant', pt: 'Zimbro fresco e dominante', de: 'Frischer und dominanter Wacholder' },
      { es: 'Cítricos y corteza de limón', en: 'Citrus and lemon peel', fr: 'Agrumes et zeste de citron', pt: 'Cítricos e casca de limão', de: 'Zitrus und Zitronenschale' },
      { es: 'Botánicos florales y especiados', en: 'Floral and spiced botanicals', fr: 'Plantes florales et épicées', pt: 'Botânicos florais e especiados', de: 'Blumige und würzige Botanicals' },
      { es: 'Base neutra, seca sin azúcar añadido', en: 'Neutral base, dry with no added sugar', fr: 'Base neutre, sec sans sucre ajouté', pt: 'Base neutra, seca sem açúcar adicionado', de: 'Neutrale Basis, trocken ohne Zuckerzusatz' },
    ],
    answers: [
      { es: 'Ginebra London Dry', en: 'London Dry Gin', fr: 'Gin London Dry', pt: 'Gin London Dry', de: 'London Dry Gin' },
      { es: 'Aquavit', en: 'Aquavit', fr: 'Aquavit', pt: 'Aquavit', de: 'Aquavit' },
      { es: 'Vodka Premium', en: 'Premium Vodka', fr: 'Vodka Premium', pt: 'Vodka Premium', de: 'Premium Wodka' },
      { es: 'Gin Sloe', en: 'Sloe Gin', fr: 'Gin de Prunelles', pt: 'Gin de Abrunho', de: 'Sloe Gin' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Ron Añejo Cubano', en: 'Cuban Aged Rum', fr: 'Rhum Vieux Cubain', pt: 'Rum Envelhecido Cubano', de: 'Kubanischer gealterter Rum' },
    clues: [
      { es: 'Melaza dulce y caña de azúcar', en: 'Sweet molasses and sugarcane', fr: 'Mélasse douce et canne à sucre', pt: 'Melaço doce e cana-de-açúcar', de: 'Süße Melasse und Zuckerrohr' },
      { es: 'Frutas tropicales maduras', en: 'Ripe tropical fruits', fr: 'Fruits tropicaux mûrs', pt: 'Frutas tropicais maduras', de: 'Reife tropische Früchte' },
      { es: 'Vainilla, caramelo y madera suave', en: 'Vanilla, caramel and soft wood', fr: 'Vanille, caramel et bois doux', pt: 'Baunilha, caramelo e madeira suave', de: 'Vanille, Karamell und weiches Holz' },
      { es: 'Producido en el Caribe hispano', en: 'Produced in the Spanish Caribbean', fr: 'Produit dans les Caraïbes hispaniques', pt: 'Produzido no Caribe hispânico', de: 'Hergestellt in der spanischen Karibik' },
    ],
    answers: [
      { es: 'Ron Añejo Cubano', en: 'Cuban Aged Rum', fr: 'Rhum Vieux Cubain', pt: 'Rum Envelhecido Cubano', de: 'Kubanischer gealterter Rum' },
      { es: 'Cachaza Envejecida', en: 'Aged Cachaça', fr: 'Cachaça Vieillie', pt: 'Cachaça Envelhecida', de: 'Gealterter Cachaça' },
      { es: 'Bourbon', en: 'Bourbon', fr: 'Bourbon', pt: 'Bourbon', de: 'Bourbon' },
      { es: 'Brandy de Jerez', en: 'Sherry Brandy', fr: 'Brandy de Jerez', pt: 'Brandy de Jerez', de: 'Sherry-Brandy' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Bourbon Kentucky', en: 'Kentucky Bourbon', fr: 'Bourbon du Kentucky', pt: 'Bourbon de Kentucky', de: 'Kentucky Bourbon' },
    clues: [
      { es: 'Vainilla intensa y caramelo', en: 'Intense vanilla and caramel', fr: 'Vanille intense et caramel', pt: 'Baunilha intensa e caramelo', de: 'Intensive Vanille und Karamell' },
      { es: 'Maíz dulce y roble nuevo carbonizado', en: 'Sweet corn and charred new oak', fr: 'Maïs doux et chêne neuf carbonisé', pt: 'Milho doce e carvalho novo carbonizado', de: 'Süßer Mais und verkohlte neue Eiche' },
      { es: 'Nuez moscada y especias de panadería', en: 'Nutmeg and baking spices', fr: 'Noix de muscade et épices de pâtisserie', pt: 'Noz-moscada e especiarias de padaria', de: 'Muskatnuss und Backgewürze' },
      { es: 'Producido en el sur de EE.UU.', en: 'Produced in the southern USA', fr: 'Produit dans le sud des États-Unis', pt: 'Produzido no sul dos EUA', de: 'Hergestellt im Süden der USA' },
    ],
    answers: [
      { es: 'Bourbon Kentucky', en: 'Kentucky Bourbon', fr: 'Bourbon du Kentucky', pt: 'Bourbon de Kentucky', de: 'Kentucky Bourbon' },
      { es: 'Rye Whiskey', en: 'Rye Whiskey', fr: 'Rye Whiskey', pt: 'Rye Whiskey', de: 'Rye Whiskey' },
      { es: 'Corn Whisky', en: 'Corn Whisky', fr: 'Whisky de Maïs', pt: 'Whisky de Milho', de: 'Corn Whisky' },
      { es: 'Whisky Canadiense', en: 'Canadian Whisky', fr: 'Whisky Canadien', pt: 'Whisky Canadense', de: 'Kanadischer Whisky' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Rye Whiskey', en: 'Rye Whiskey', fr: 'Rye Whiskey', pt: 'Rye Whiskey', de: 'Rye Whiskey' },
    clues: [
      { es: 'Especias intensas: pimienta y centeno', en: 'Intense spices: pepper and rye', fr: 'Épices intenses : poivre et seigle', pt: 'Especiarias intensas: pimenta e centeio', de: 'Intensive Gewürze: Pfeffer und Roggen' },
      { es: 'Seco y robusto, menos dulce que el bourbon', en: 'Dry and robust, less sweet than bourbon', fr: 'Sec et robuste, moins sucré que le bourbon', pt: 'Seco e robusto, menos doce que o bourbon', de: 'Trocken und robust, weniger süß als Bourbon' },
      { es: 'Menta, anís y frutas secas', en: 'Mint, anise and dried fruits', fr: 'Menthe, anis et fruits secs', pt: 'Menta, anis e frutas secas', de: 'Minze, Anis und Trockenfrüchte' },
      { es: 'Popular en cócteles como el Manhattan', en: 'Popular in cocktails like the Manhattan', fr: 'Populaire dans des cocktails comme le Manhattan', pt: 'Popular em coquetéis como o Manhattan', de: 'Beliebt in Cocktails wie dem Manhattan' },
    ],
    answers: [
      { es: 'Rye Whiskey', en: 'Rye Whiskey', fr: 'Rye Whiskey', pt: 'Rye Whiskey', de: 'Rye Whiskey' },
      { es: 'Bourbon', en: 'Bourbon', fr: 'Bourbon', pt: 'Bourbon', de: 'Bourbon' },
      { es: 'Scotch Single Malt', en: 'Single Malt Scotch', fr: 'Scotch Single Malt', pt: 'Scotch Single Malt', de: 'Single Malt Scotch' },
      { es: 'Irish Whiskey', en: 'Irish Whiskey', fr: 'Irish Whiskey', pt: 'Irish Whiskey', de: 'Irish Whiskey' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Calvados', en: 'Calvados', fr: 'Calvados', pt: 'Calvados', de: 'Calvados' },
    clues: [
      { es: 'Manzana y pera cocida', en: 'Cooked apple and pear', fr: 'Pomme et poire cuites', pt: 'Maçã e pera cozida', de: 'Gekochter Apfel und Birne' },
      { es: 'Canela y clavo de especias', en: 'Cinnamon and clove spices', fr: 'Cannelle et clou de girofle', pt: 'Canela e cravo-da-índia', de: 'Zimt und Nelkengewürze' },
      { es: 'Notas terrosas de Normandía', en: 'Earthy notes from Normandy', fr: 'Notes terreuses de Normandie', pt: 'Notas terrosas da Normandia', de: 'Erdige Noten aus der Normandie' },
      { es: 'Brandy de fruta de hueso', en: 'Stone fruit brandy', fr: 'Eau-de-vie de fruits à noyau', pt: 'Brandy de fruta de caroço', de: 'Steinobstbrand' },
    ],
    answers: [
      { es: 'Calvados', en: 'Calvados', fr: 'Calvados', pt: 'Calvados', de: 'Calvados' },
      { es: 'Cognac', en: 'Cognac', fr: 'Cognac', pt: 'Cognac', de: 'Cognac' },
      { es: 'Eau de Vie de Poire', en: 'Poire Williams', fr: 'Eau de Vie de Poire', pt: 'Eau de Vie de Pera', de: 'Birnen-Eau-de-Vie' },
      { es: 'Applejack', en: 'Applejack', fr: 'Applejack', pt: 'Applejack', de: 'Applejack' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Aquavit', en: 'Aquavit', fr: 'Aquavit', pt: 'Aquavit', de: 'Aquavit' },
    clues: [
      { es: 'Alcaravea o eneldo prominente', en: 'Prominent caraway or dill', fr: 'Carvi ou aneth proéminent', pt: 'Alcaravia ou endro proeminente', de: 'Markanter Kümmel oder Dill' },
      { es: 'Anís y hierbas escandinavas', en: 'Anise and Scandinavian herbs', fr: 'Anis et herbes scandinaves', pt: 'Anis e ervas escandinavas', de: 'Anis und skandinavische Kräuter' },
      { es: 'Frescor y notas minerales', en: 'Freshness and mineral notes', fr: 'Fraîcheur et notes minérales', pt: 'Frescor e notas minerais', de: 'Frische und mineralische Noten' },
      { es: 'Espíritu nacional de los países nórdicos', en: 'National spirit of the Nordic countries', fr: 'Spiritueux national des pays nordiques', pt: 'Espírito nacional dos países nórdicos', de: 'Nationalgetränk der nordischen Länder' },
    ],
    answers: [
      { es: 'Aquavit', en: 'Aquavit', fr: 'Aquavit', pt: 'Aquavit', de: 'Aquavit' },
      { es: 'Jenever', en: 'Jenever', fr: 'Genièvre', pt: 'Jenever', de: 'Jenever' },
      { es: 'Absenta', en: 'Absinthe', fr: 'Absinthe', pt: 'Absinto', de: 'Absinth' },
      { es: 'Pastis', en: 'Pastis', fr: 'Pastis', pt: 'Pastis', de: 'Pastis' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Absenta', en: 'Absinthe', fr: 'Absinthe', pt: 'Absinto', de: 'Absinth' },
    clues: [
      { es: 'Anís verde intenso y regaliz', en: 'Intense green anise and licorice', fr: 'Anis vert intense et réglisse', pt: 'Anis verde intenso e alcaçuz', de: 'Intensiver grüner Anis und Lakritze' },
      { es: 'Hierba de ajenjo (wormwood) herbácea', en: 'Herbaceous wormwood', fr: 'Absinthe (armoise) herbacée', pt: 'Losna (absinto) herbácea', de: 'Krautiger Wermut' },
      { es: 'Color verde brillante natural', en: 'Natural bright green color', fr: 'Couleur verte brillante naturelle', pt: 'Cor verde brilhante natural', de: 'Natürlich leuchtend grüne Farbe' },
      { es: 'La "hada verde" del siglo XIX', en: 'The "green fairy" of the 19th century', fr: 'La "fée verte" du XIXe siècle', pt: 'A "fada verde" do século XIX', de: 'Die "grüne Fee" des 19. Jahrhunderts' },
    ],
    answers: [
      { es: 'Absenta', en: 'Absinthe', fr: 'Absinthe', pt: 'Absinto', de: 'Absinth' },
      { es: 'Pastis', en: 'Pastis', fr: 'Pastis', pt: 'Pastis', de: 'Pastis' },
      { es: 'Ouzo', en: 'Ouzo', fr: 'Ouzo', pt: 'Ouzo', de: 'Ouzo' },
      { es: 'Sambuca', en: 'Sambuca', fr: 'Sambuca', pt: 'Sambuca', de: 'Sambuca' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Cachaza', en: 'Cachaça', fr: 'Cachaça', pt: 'Cachaça', de: 'Cachaça' },
    clues: [
      { es: 'Caña de azúcar fresca y verde', en: 'Fresh green sugarcane', fr: 'Canne à sucre fraîche et verte', pt: 'Cana-de-açúcar fresca e verde', de: 'Frisches grünes Zuckerrohr' },
      { es: 'Notas herbáceas y terrosas', en: 'Herbaceous and earthy notes', fr: 'Notes herbacées et terreuses', pt: 'Notas herbáceas e terrosas', de: 'Krautige und erdige Noten' },
      { es: 'Ligero toque de levadura', en: 'Light touch of yeast', fr: 'Légère touche de levure', pt: 'Leve toque de fermento', de: 'Leichter Hefeanklang' },
      { es: 'Espíritu nacional de Brasil', en: 'National spirit of Brazil', fr: 'Spiritueux national du Brésil', pt: 'Espírito nacional do Brasil', de: 'Nationalgetränk Brasiliens' },
    ],
    answers: [
      { es: 'Cachaza', en: 'Cachaça', fr: 'Cachaça', pt: 'Cachaça', de: 'Cachaça' },
      { es: 'Ron Blanco', en: 'White Rum', fr: 'Rhum Blanc', pt: 'Rum Branco', de: 'Weißer Rum' },
      { es: 'Aguardiente de Caña', en: 'Sugarcane Spirit', fr: 'Eau-de-vie de Canne', pt: 'Aguardente de Cana', de: 'Zuckerrohrschnaps' },
      { es: 'Clairin', en: 'Clairin', fr: 'Clairin', pt: 'Clairin', de: 'Clairin' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Armagnac', en: 'Armagnac', fr: 'Armagnac', pt: 'Armagnac', de: 'Armagnac' },
    clues: [
      { es: 'Ciruela, higo y fruta seca intensa', en: 'Plum, fig and intense dried fruit', fr: 'Prune, figue et fruits secs intenses', pt: 'Ameixa, figo e fruta seca intensa', de: 'Pflaume, Feige und intensive Trockenfrüchte' },
      { es: 'Más rústico y complejo que el Cognac', en: 'More rustic and complex than Cognac', fr: 'Plus rustique et complexe que le Cognac', pt: 'Mais rústico e complexo que o Cognac', de: 'Rustikaler und komplexer als Cognac' },
      { es: 'Destilado una sola vez en alambique continuo', en: 'Single distilled in a continuous still', fr: 'Distillé une seule fois en alambic continu', pt: 'Destilado uma única vez em alambique contínuo', de: 'Einfach in einer kontinuierlichen Brennblase destilliert' },
      { es: 'Producido en Gascuña, Francia', en: 'Produced in Gascony, France', fr: 'Produit en Gascogne, France', pt: 'Produzido na Gasconha, França', de: 'Hergestellt in der Gascogne, Frankreich' },
    ],
    answers: [
      { es: 'Armagnac', en: 'Armagnac', fr: 'Armagnac', pt: 'Armagnac', de: 'Armagnac' },
      { es: 'Cognac', en: 'Cognac', fr: 'Cognac', pt: 'Cognac', de: 'Cognac' },
      { es: 'Calvados', en: 'Calvados', fr: 'Calvados', pt: 'Calvados', de: 'Calvados' },
      { es: 'Pisco', en: 'Pisco', fr: 'Pisco', pt: 'Pisco', de: 'Pisco' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Whisky Japonés', en: 'Japanese Whisky', fr: 'Whisky Japonais', pt: 'Whisky Japonês', de: 'Japanischer Whisky' },
    clues: [
      { es: 'Delicado equilibrio floral y afrutado', en: 'Delicate floral and fruity balance', fr: 'Équilibre délicat floral et fruité', pt: 'Delicado equilíbrio floral e frutado', de: 'Zartes blumiges und fruchtiges Gleichgewicht' },
      { es: 'Roble Mizunara y bambú', en: 'Mizunara oak and bamboo', fr: 'Chêne Mizunara et bambou', pt: 'Carvalho Mizunara e bambu', de: 'Mizunara-Eiche und Bambus' },
      { es: 'Técnica escocesa con alma japonesa', en: 'Scottish technique with Japanese soul', fr: 'Technique écossaise avec une âme japonaise', pt: 'Técnica escocesa com alma japonesa', de: 'Schottische Technik mit japanischer Seele' },
      { es: 'Producido con agua de manantiales volcánicos', en: 'Produced with volcanic spring water', fr: 'Produit avec de l\'eau de sources volcaniques', pt: 'Produzido com água de nascentes vulcânicas', de: 'Hergestellt mit vulkanischem Quellwasser' },
    ],
    answers: [
      { es: 'Whisky Japonés', en: 'Japanese Whisky', fr: 'Whisky Japonais', pt: 'Whisky Japonês', de: 'Japanischer Whisky' },
      { es: 'Scotch Blended', en: 'Blended Scotch', fr: 'Scotch Blended', pt: 'Scotch Blended', de: 'Blended Scotch' },
      { es: 'Bourbon', en: 'Bourbon', fr: 'Bourbon', pt: 'Bourbon', de: 'Bourbon' },
      { es: 'Irish Whiskey', en: 'Irish Whiskey', fr: 'Irish Whiskey', pt: 'Irish Whiskey', de: 'Irish Whiskey' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Irish Whiskey', en: 'Irish Whiskey', fr: 'Irish Whiskey', pt: 'Irish Whiskey', de: 'Irish Whiskey' },
    clues: [
      { es: 'Suave, ligero y muy fácil de beber', en: 'Smooth, light and very easy to drink', fr: 'Doux, léger et très facile à boire', pt: 'Suave, leve e muito fácil de beber', de: 'Weich, leicht und sehr leicht zu trinken' },
      { es: 'Triple destilado, sin turba', en: 'Triple distilled, no peat', fr: 'Triple distillé, sans tourbe', pt: 'Tripla destilação, sem turfa', de: 'Dreifach destilliert, ohne Torf' },
      { es: 'Miel y malta de cebada', en: 'Honey and barley malt', fr: 'Miel et malt d\'orge', pt: 'Mel e malte de cevada', de: 'Honig und Gerstenmalz' },
      { es: 'Espíritu de la Isla de Esmeralda', en: 'Spirit of the Emerald Isle', fr: 'Spiritueux de l\'Île d\'Émeraude', pt: 'Espírito da Ilha Esmeralda', de: 'Geist der Grünen Insel' },
    ],
    answers: [
      { es: 'Irish Whiskey', en: 'Irish Whiskey', fr: 'Irish Whiskey', pt: 'Irish Whiskey', de: 'Irish Whiskey' },
      { es: 'Scotch Single Malt', en: 'Single Malt Scotch', fr: 'Scotch Single Malt', pt: 'Scotch Single Malt', de: 'Single Malt Scotch' },
      { es: 'Whisky Galés', en: 'Welsh Whisky', fr: 'Whisky Gallois', pt: 'Whisky Galês', de: 'Walisischer Whisky' },
      { es: 'Bourbon', en: 'Bourbon', fr: 'Bourbon', pt: 'Bourbon', de: 'Bourbon' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Vodka Premium', en: 'Premium Vodka', fr: 'Vodka Premium', pt: 'Vodka Premium', de: 'Premium Wodka' },
    clues: [
      { es: 'Neutro y cristalino', en: 'Neutral and crystal clear', fr: 'Neutre et cristallin', pt: 'Neutro e cristalino', de: 'Neutral und kristallklar' },
      { es: 'Ligera dulzura de cereales o papa', en: 'Light sweetness from grain or potato', fr: 'Légère douceur de céréales ou pomme de terre', pt: 'Leve doçura de cereais ou batata', de: 'Leichte Süße von Getreide oder Kartoffel' },
      { es: 'Mínimo sabor, máxima pureza', en: 'Minimal flavor, maximum purity', fr: 'Saveur minimale, pureté maximale', pt: 'Sabor mínimo, pureza máxima', de: 'Minimaler Geschmack, maximale Reinheit' },
      { es: 'La base de innumerables cócteles modernos', en: 'The base of countless modern cocktails', fr: 'La base d\'innombrables cocktails modernes', pt: 'A base de inúmeros coquetéis modernos', de: 'Die Basis unzähliger moderner Cocktails' },
    ],
    answers: [
      { es: 'Vodka Premium', en: 'Premium Vodka', fr: 'Vodka Premium', pt: 'Vodka Premium', de: 'Premium Wodka' },
      { es: 'Ginebra sin botánicos', en: 'Gin without botanicals', fr: 'Gin sans plantes aromatiques', pt: 'Gin sem botânicos', de: 'Gin ohne Botanicals' },
      { es: 'Alcohol de grano joven', en: 'Young grain alcohol', fr: 'Alcool de grain jeune', pt: 'Álcool de grão jovem', de: 'Junger Kornalkohol' },
      { es: 'Grappa Blanca', en: 'White Grappa', fr: 'Grappa Blanche', pt: 'Grappa Branca', de: 'Weiße Grappa' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Grappa', en: 'Grappa', fr: 'Grappa', pt: 'Grappa', de: 'Grappa' },
    clues: [
      { es: 'Uva y piel de hollejo fermentada', en: 'Grape and fermented grape skin', fr: 'Raisin et peau de marc fermentée', pt: 'Uva e casca de bagaço fermentada', de: 'Traube und fermentierte Traubenschale' },
      { es: 'Floral, frutal y ligeramente áspero', en: 'Floral, fruity and slightly rough', fr: 'Floral, fruité et légèrement rude', pt: 'Floral, frutado e levemente áspero', de: 'Blumig, fruchtig und leicht rau' },
      { es: 'Producida en Italia con orujo de uva', en: 'Produced in Italy from grape pomace', fr: 'Produite en Italie à partir de marc de raisin', pt: 'Produzida na Itália com bagaço de uva', de: 'In Italien aus Traubentrestern hergestellt' },
      { es: 'Espíritu de las bodegas italianas', en: 'Spirit of Italian wineries', fr: 'Spiritueux des caves italiennes', pt: 'Espírito das vinícolas italianas', de: 'Geist der italienischen Weingüter' },
    ],
    answers: [
      { es: 'Grappa', en: 'Grappa', fr: 'Grappa', pt: 'Grappa', de: 'Grappa' },
      { es: 'Marc francés', en: 'French Marc', fr: 'Marc français', pt: 'Marc francês', de: 'Französischer Marc' },
      { es: 'Orujo español', en: 'Spanish Orujo', fr: 'Orujo espagnol', pt: 'Orujo espanhol', de: 'Spanischer Orujo' },
      { es: 'Pisco', en: 'Pisco', fr: 'Pisco', pt: 'Pisco', de: 'Pisco' },
    ],
    correctIndex: 0,
  },
  {
    name: { es: 'Pisco', en: 'Pisco', fr: 'Pisco', pt: 'Pisco', de: 'Pisco' },
    clues: [
      { es: 'Uvas aromáticas frescas: Italia, Moscatel', en: 'Fresh aromatic grapes: Italia, Muscat', fr: 'Raisins aromatiques frais : Italia, Muscat', pt: 'Uvas aromáticas frescas: Itália, Moscatel', de: 'Frische aromatische Trauben: Italia, Muskateller' },
      { es: 'Flores blancas y frutas de hueso', en: 'White flowers and stone fruits', fr: 'Fleurs blanches et fruits à noyau', pt: 'Flores brancas e frutas de caroço', de: 'Weiße Blüten und Steinobst' },
      { es: 'Sin envejecimiento en barrica', en: 'No barrel aging', fr: 'Sans vieillissement en fût', pt: 'Sem envelhecimento em barril', de: 'Keine Fassreifung' },
      { es: 'Espíritu nacional de Perú y Chile', en: 'National spirit of Peru and Chile', fr: 'Spiritueux national du Pérou et du Chili', pt: 'Espírito nacional do Peru e do Chile', de: 'Nationalgetränk von Peru und Chile' },
    ],
    answers: [
      { es: 'Pisco', en: 'Pisco', fr: 'Pisco', pt: 'Pisco', de: 'Pisco' },
      { es: 'Grappa Blanca', en: 'White Grappa', fr: 'Grappa Blanche', pt: 'Grappa Branca', de: 'Weiße Grappa' },
      { es: 'Cognac Joven', en: 'Young Cognac', fr: 'Cognac Jeune', pt: 'Cognac Jovem', de: 'Junger Cognac' },
      { es: 'Aguardiente de Uva', en: 'Grape Spirit', fr: 'Eau-de-vie de Raisin', pt: 'Aguardente de Uva', de: 'Traubenbrand' },
    ],
    correctIndex: 0,
  },
];

let bs = null;

export function startBlind() {
  const questions = shuffle(SPIRITS);
  bs = { questions, index: 0, correct: 0, answered: 0, revealed: 1, history: [] };
  return _payload();
}

function _payload() {
  const q = bs.questions[bs.index];
  return { clues: q.clues, revealedClues: bs.revealed, answers: q.answers, correctIndex: 0, index: bs.index, total: bs.questions.length, correct: bs.correct };
}

export function revealNextClue() {
  if (!bs) return null;
  const q = bs.questions[bs.index];
  bs.revealed = Math.min(bs.revealed + 1, q.clues.length);
  return _payload();
}

export function answerBlind(selectedIndex) {
  if (!bs) return null;
  const q = bs.questions[bs.index];
  const ok = selectedIndex === 0;
  if (ok) bs.correct++;
  // Capture the per-question outcome so the finish screen can show a
  // breakdown of what the player got right / wrong.
  bs.history.push({
    name: q.name,
    answers: q.answers,
    correctIndex: 0,
    selectedIndex,
    correct: ok,
  });
  bs.answered++;
  bs.index++;
  bs.revealed = 1; // Reset clue count for the next question
  const done = bs.index >= bs.questions.length;
  return {
    correct: ok,
    correctIndex: 0,
    selectedIndex,
    done,
    result: done ? { correct: bs.correct, total: bs.questions.length, history: bs.history.slice() } : null,
    next: done ? null : _payload(),
  };
}

export function abortBlind() { bs = null; }
