export const rounds = [
  {
    id: 1,
    title: "IBA Clásicos",
    subtitle: "Cócteles Oficiales IBA",
    icon: "🍸",
    color: "#c9971c",
    questions: [
      { q: "¿Cuántas categorías de cócteles oficiales reconoce la IBA?", a: ["3", "2", "4", "5"], exp: "La IBA reconoce 3 categorías: 'The Unforgettables', 'Contemporary Classics' y 'New Era Drinks'." },
      { q: "¿Cuál es el espíritu base del Negroni?", a: ["Ginebra", "Vodka", "Ron", "Whisky"], exp: "El Negroni clásico se elabora con ginebra, Campari y vermut dulce en proporciones iguales." },
      { q: "¿Qué cóctel IBA lleva tequila, triple sec y zumo de lima?", a: ["Margarita", "Cosmopolitan", "Daiquiri", "Gimlet"], exp: "La Margarita es uno de los cócteles IBA más famosos, con tequila, triple sec y lima." },
      { q: "¿Cuál es el ingrediente que distingue al Sazerac?", a: ["Un lavado de absenta", "Vermut seco", "Bitters de naranja", "Sirope de granadina"], exp: "El Sazerac se sirve en una copa lavada con absenta, lo que le da su aroma único." },
      { q: "¿Qué significa IBA?", a: ["International Bartenders Association", "International Bar Alliance", "Institute of Beverage Arts", "International Brewing Academy"], exp: "IBA son las siglas de International Bartenders Association, fundada en 1951." },
      { q: "¿Qué cóctel IBA se elabora con champán y cognac?", a: ["Champagne Cocktail", "French 75", "Kir Royale", "Bellini"], exp: "El Champagne Cocktail clásico IBA lleva un terrón de azúcar, Angostura bitters, cognac y champán." },
      { q: "¿Cuál es el cóctel IBA que contiene Campari, vermut dulce y ginebra?", a: ["Negroni", "Americano", "Boulevardier", "Aperol Spritz"], exp: "El Negroni es la mezcla perfecta de ginebra, Campari y vermut dulce." },
      { q: "¿Qué cóctel IBA se sirve en un vaso largo con ron, menta, lima y agua con gas?", a: ["Mojito", "Caipirinha", "Dark and Stormy", "Ti' Punch"], exp: "El Mojito cubano es uno de los cócteles más populares del mundo, con ron blanco, menta, lima y soda." },
      { q: "¿Qué cóctel IBA lleva vodka, zumo de tomate y especias?", a: ["Bloody Mary", "Harvey Wallbanger", "Sea Breeze", "Cosmopolitan"], exp: "El Bloody Mary es el cóctel revitalizante por excelencia, con vodka y zumo de tomate." },
      { q: "El Dry Martini IBA se elabora con ginebra y...", a: ["Vermut seco", "Vermut dulce", "Triple sec", "Cointreau"], exp: "El Dry Martini clásico IBA combina ginebra con vermut seco y se decora con una aceituna o corteza de limón." }
    ]
  },
  {
    id: 2,
    title: "Espíritus Clásicos",
    subtitle: "Destilados del Mundo",
    icon: "🥃",
    color: "#a0522d",
    questions: [
      { q: "¿Qué porcentaje mínimo de maíz debe contener el bourbon?", a: ["51%", "60%", "70%", "80%"], exp: "Para ser clasificado como bourbon, el mash bill debe contener al menos un 51% de maíz." },
      { q: "¿De qué planta se elabora el tequila?", a: ["Agave azul", "Mezcal agave", "Maguey", "Nopal"], exp: "El tequila solo puede elaborarse con Agave Tequilana Weber, variedad azul, en determinadas regiones de México." },
      { q: "¿Cuántos años debe envejecer mínimo el Scotch Whisky?", a: ["3 años", "5 años", "10 años", "1 año"], exp: "La ley escocesa exige un mínimo de 3 años de envejecimiento en barricas de roble." },
      { q: "¿Qué es el Cognac?", a: ["Un brandy francés de la región de Cognac", "Un ron añejo francés", "Un calvados envejecido", "Un armagnac premium"], exp: "El Cognac es un brandy de vino elaborado en la región de Cognac, en el departamento de Charente, Francia." },
      { q: "¿En qué se diferencia el mezcal del tequila?", a: ["El mezcal puede hacerse con cualquier agave; el tequila solo con agave azul", "El mezcal es más dulce", "El tequila tiene más ABV", "Solo difieren en la región"], exp: "El mezcal puede producirse con más de 30 variedades de agave, mientras el tequila usa exclusivamente agave azul." },
      { q: "¿Qué es el ABV?", a: ["Alcohol By Volume (Alcohol por Volumen)", "Average Barrel Value", "Aged Barrel Vintage", "Alcohol Base Value"], exp: "ABV significa Alcohol By Volume y expresa el porcentaje de etanol en una bebida." },
      { q: "¿Qué botánico es imprescindible en la ginebra?", a: ["Enebro (Juniper)", "Cilantro", "Angélica", "Cardamomo"], exp: "Por ley, la ginebra debe tener como botánico predominante el enebro (Juniperus communis)." },
      { q: "¿Cuál es la materia prima del ron?", a: ["Caña de azúcar", "Agave", "Cebada", "Maíz"], exp: "El ron se destila a partir de jugo de caña de azúcar o melaza, subproducto de la fabricación de azúcar." },
      { q: "¿Qué botánico característico tiene el aquavit?", a: ["Alcaravea o eneldo", "Enebro", "Anís", "Hinojo"], exp: "El aquavit escandinavo debe su sabor característico a la alcaravea (caraway) o al eneldo." },
      { q: "¿Qué es el calvados?", a: ["Brandy de manzana de Normandía", "Sidra destilada de Bretaña", "Ron de manzana del Caribe", "Licor de pera alsaciano"], exp: "El Calvados es una denominación de origen protegida para el brandy de sidra de manzana producido en Normandía, Francia." }
    ]
  },
  {
    id: 3,
    title: "Técnicas de Bar",
    subtitle: "Arte de la Coctelería",
    icon: "🔀",
    color: "#2980b9",
    questions: [
      { q: "¿Qué significa 'muddling' en coctelería?", a: ["Machacar ingredientes en el vaso", "Agitar con hielo", "Colar la bebida", "Flambear el cóctel"], exp: "El muddling consiste en machacar suavemente frutas, hierbas o azúcar en el fondo del vaso para extraer sus aromas y jugos." },
      { q: "¿Cuál es la diferencia principal entre agitar y remover un cóctel?", a: ["Agitar incorpora más aire y dilución; remover es más sutil", "Agitar conserva la temperatura mejor", "Remover mezcla más rápido", "No hay diferencia significativa"], exp: "Agitar oxigena la bebida y diluye más rápidamente; remover es para cócteles más delicados que no deben turbarse." },
      { q: "¿Qué es un 'dry shake'?", a: ["Agitar sin hielo, generalmente con clara de huevo", "Agitar con hielo seco", "Batir sin ingredientes alcohólicos", "Agitar en coctelera seca"], exp: "El dry shake (sin hielo) se usa para emulsionar clara de huevo o crema antes de añadir hielo, logrando mejor textura." },
      { q: "¿Qué técnica consiste en verter lentamente sobre una cuchara para crear capas?", a: ["Floating (flotado)", "Rolling (rodado)", "Straining (colado)", "Muddling"], exp: "El floating usa una cuchara de bar para guiar el líquido suavemente y crear capas de densidades distintas." },
      { q: "¿Qué significa pedir un cóctel 'on the rocks'?", a: ["Servido sobre cubitos de hielo", "Sin hielo, a temperatura ambiente", "Con hielo triturado", "Con hielo esférico"], exp: "'On the rocks' significa que el cóctel se sirve directamente sobre cubitos de hielo en el vaso." },
      { q: "¿Qué es el 'fat washing'?", a: ["Infusionar un destilado con grasa para añadir sabor", "Limpiar el vaso con grasa", "Técnica de filtración con mantequilla", "Añadir aceite de coco al cóctel"], exp: "El fat washing es una técnica donde se mezcla una grasa (mantequilla, bacon, etc.) con un destilado y luego se congela para separar y filtrar la grasa, dejando el sabor." },
      { q: "¿Qué significa 'neat' al pedir un destilado?", a: ["Solo el destilado, sin hielo ni mezcla", "Con un poco de agua", "Muy frío, sin hielo", "Con una pizca de sal"], exp: "'Neat' significa el espíritu tal cual, sin hielo, sin agua y sin ningún otro ingrediente." },
      { q: "¿Cuál es el propósito del 'rolling' en coctelería?", a: ["Mezclar suavemente vertiendo entre dos recipientes", "Agitar con movimiento circular", "Rodar la coctelera sobre la barra", "Verter sobre una piedra de hielo"], exp: "El rolling consiste en verter el cóctel de un recipiente a otro varias veces para mezclar con suavidad y mínima dilución." },
      { q: "¿Qué es 'express' una piel de cítrico en un cóctel?", a: ["Torcer la piel sobre el vaso para liberar aceites esenciales", "Exprimir el zumo de la fruta", "Rallar la piel sobre la bebida", "Quemar la piel cerca del vaso"], exp: "Al expressar la piel, se tuerce sobre el cóctel para liberar los aceites aromáticos esenciales que flotan en la superficie." },
      { q: "¿Cuántos segundos aproximados tarda en enfriarse un cóctel bien agitado con hielo?", a: ["10-15 segundos", "30-45 segundos", "5 segundos", "60 segundos"], exp: "Agitar enérgicamente durante 10-15 segundos es suficiente para enfriar correctamente un cóctel y conseguir la dilución adecuada." }
    ]
  },
  {
    id: 4,
    title: "Cristalería & Herramientas",
    subtitle: "El Equipo del Bartender",
    icon: "🫗",
    color: "#27ae60",
    questions: [
      { q: "¿Qué tipo de copa se usa para un Martini clásico?", a: ["Copa de Martini (cóctel)", "Copa de champán tipo flauta", "Copa de balón", "Vaso highball"], exp: "El Martini se sirve en la copa de cóctel o Martini, con su icónica forma triangular y tallo largo." },
      { q: "¿Qué es un jigger?", a: ["Medidor de doble copa para porciones exactas", "Colador de malla fina", "Cucharilla larga de bar", "Tipo de coctelera pequeña"], exp: "El jigger es el medidor estándar del bartender, generalmente con dos compartimentos de diferente volumen (1oz y 1.5oz o similar)." },
      { q: "¿Para qué sirve el colador Hawthorne?", a: ["Colar la bebida reteniendo hielo y pulpa con su resorte", "Medir el volumen del cóctel", "Añadir el hielo al vaso", "Remover ingredientes en la coctelera"], exp: "El colador Hawthorne tiene un resorte metálico que retiene hielo, frutas y hierbas al verter el cóctel en el vaso." },
      { q: "¿Cuál es la diferencia entre una copa de flauta y una copa coupe?", a: ["La flauta conserva las burbujas; la coupe es ancha y plana", "La coupe es para champán; la flauta para espumosos", "Son intercambiables sin diferencia", "La flauta tiene más capacidad"], exp: "La flauta alarga el camino de las burbujas preservando el carbónico; la coupe es retro, ancha y permite mejor nariz pero pierde gas rápido." },
      { q: "¿Qué capacidad tiene un 'shot' estándar en España?", a: ["30-40 ml", "25 ml", "50 ml", "20 ml"], exp: "En España, un shot o chupito estándar es de 30-40 ml, aunque puede variar por establecimiento." },
      { q: "¿Para qué se usa el muddler?", a: ["Machacar frutas, hierbas y azúcar en el vaso", "Remover el cóctel", "Medir los ingredientes", "Decorar el borde del vaso"], exp: "El muddler (pisón) es una herramienta de madera, plástico o acero inoxidable para machacar ingredientes y liberar sus jugos y aromas." },
      { q: "¿Cuál es la función principal de la cucharilla de bar larga?", a: ["Remover cócteles y medir pequeñas cantidades", "Solo decoración", "Servir como muddler pequeño", "Medir el ABV"], exp: "La cucharilla larga permite remover en vasos altos sin salpicaduras y su volumen estándar (5ml) sirve como medida." },
      { q: "¿Qué es una 'Boston Shaker'?", a: ["Sistema de dos piezas: tin de metal + vaso de cristal o tin", "Coctelera de tres piezas con colador integrado", "Tipo de coctelera para dos personas", "Coctelera especial para cócteles calientes"], exp: "La Boston Shaker consta de dos recipientes (generalmente dos tins o un tin y un vaso) que encajan herméticamente para agitar." },
      { q: "¿En qué vaso se sirve un Cuba Libre?", a: ["Vaso highball", "Vaso old fashioned", "Copa de Martini", "Copa de balón"], exp: "El Cuba Libre (ron, cola, lima) se sirve en vaso highball, un vaso alto y recto de unos 250-350 ml." },
      { q: "¿Qué es un 'strainer' de Julep?", a: ["Colador de dientes de metal sin resorte para vasos de mezcla", "Colador Hawthorne más pequeño", "Tipo de malla fina para pulpa", "Tapón perforado de la coctelera"], exp: "El Julep strainer es un colador simple de metal con agujeros, diseñado para encajar en el vaso de mezcla o mixing glass." }
    ]
  },
  {
    id: 5,
    title: "Historia del Cóctel",
    subtitle: "Orígenes & Leyendas",
    icon: "📜",
    color: "#8e44ad",
    questions: [
      { q: "¿En qué año se publicó el primer libro de recetas de cócteles reconocido?", a: ["1862", "1920", "1880", "1910"], exp: "'The Bartender's Guide' de Jerry Thomas se publicó en 1862 y es considerado el primer libro de cócteles." },
      { q: "¿Qué duró la Ley Seca (Prohibition) en Estados Unidos?", a: ["1920 a 1933", "1915 a 1930", "1925 a 1940", "1910 a 1925"], exp: "La Prohibition Act prohibió el alcohol en EE.UU. desde enero de 1920 hasta diciembre de 1933." },
      { q: "¿Dónde apareció en prensa por primera vez la palabra 'cocktail'?", a: ["The Balance, periódico de Nueva York, 1806", "The Times de Londres, 1820", "Le Monde de París, 1815", "The Boston Globe, 1800"], exp: "La primera definición escrita de 'cocktail' apareció en el periódico The Balance and Columbian Repository el 13 de mayo de 1806." },
      { q: "¿Quién escribió 'The Savoy Cocktail Book' (1930)?", a: ["Harry Craddock", "Jerry Thomas", "Dick Bradsell", "Dale DeGroff"], exp: "Harry Craddock, bartender jefe del American Bar del hotel Savoy de Londres, escribió este clásico en 1930." },
      { q: "¿En qué hotel de Singapur se inventó el Singapore Sling?", a: ["Raffles Hotel", "Marina Bay Sands", "Fullerton Hotel", "Capella Singapore"], exp: "El Singapore Sling fue creado por Ngiam Tong Boon en el Long Bar del Raffles Hotel alrededor de 1915." },
      { q: "¿Qué fue el 'bathtub gin' durante la Prohibition?", a: ["Ginebra ilegal fabricada en casa durante la Ley Seca", "Un cóctel con ginebra y agua con gas", "Ginebra envejecida en barriles", "Un destilado artesanal de alta calidad"], exp: "El bathtub gin era alcohol de baja calidad mezclado con botánicos en destilerías ilegales caseras durante la Prohibition." },
      { q: "¿Cuál se considera la 'Edad de Oro' de los cócteles?", a: ["Era victoriana / pre-Prohibition (1860-1920)", "Años 50-60 del siglo XX", "Años 80 del siglo XX", "La década de 2010"], exp: "La era pre-Prohibition, especialmente de 1860 a 1920, es la primera Edad de Oro cuando se establecieron las bases de la coctelería moderna." },
      { q: "¿Cómo se conoce a Jerry Thomas en la historia de la coctelería?", a: ["El padre de la bartería americana", "El inventor del Martini", "El creador del Negroni", "El primer sommelier de EE.UU."], exp: "Jerry Thomas, autor del primer libro de cócteles, es conocido como 'el padre de la mixología americana'." },
      { q: "¿Qué movimiento revitalizó la coctelería artesanal a principios del siglo XXI?", a: ["El movimiento craft cocktail / mixología artesanal", "El boom de los bares de tapas", "La revolución de la cerveza artesana", "El auge de los vinos naturales"], exp: "A partir de los años 2000, el movimiento craft cocktail recuperó técnicas clásicas y usó ingredientes frescos y de calidad, transformando la industria." },
      { q: "¿En qué ciudad nació el cóctel Aperol Spritz como bebida moderna popular?", a: ["Venecia / Véneto, Italia", "Milán, Italia", "Roma, Italia", "Florencia, Italia"], exp: "El Aperol Spritz tiene raíces en la tradición del Véneto italiano; Aperol se creó en Padua en 1919 y el spritz es una tradición de esta región." }
    ]
  },
  {
    id: 6,
    title: "Trópicos & Ron",
    subtitle: "El Paraíso en un Vaso",
    icon: "🌴",
    color: "#e67e22",
    questions: [
      { q: "¿Cuál es el espíritu base del Mojito?", a: ["Ron blanco", "Ron añejo", "Cachaça", "Ginebra"], exp: "El Mojito cubano clásico se elabora con ron blanco, menta fresca, lima, azúcar y agua con gas." },
      { q: "¿Dónde se inventó la Piña Colada?", a: ["Puerto Rico", "Cuba", "Jamaica", "Colombia"], exp: "La Piña Colada es el cóctel nacional de Puerto Rico, creado en San Juan en la década de 1950." },
      { q: "¿Qué significa 'Mai Tai' en tahitiano?", a: ["Fuera de este mundo / ¡Genial!", "Bebida del sol", "Néctar tropical", "Brindis de paz"], exp: "Mai Tai en tahitiano significa literalmente 'fuera de este mundo'. Al probarlo, Trader Vic dijo 'mai tai, roa ae' (fuera de este mundo, lo mejor)." },
      { q: "¿De qué se elabora la cachaça brasileña?", a: ["Jugo de caña de azúcar fresco", "Melaza de caña", "Maíz", "Yuca"], exp: "La cachaça se distingue del ron en que se destila directamente del jugo fresco de caña de azúcar, no de melaza." },
      { q: "¿Cuál es la diferencia entre ron agrícola y ron industrial?", a: ["El agrícola se destila de jugo de caña; el industrial, de melaza", "El agrícola tiene más graduación", "El industrial se envejece más tiempo", "Solo difieren en la marca"], exp: "El ron agrícola (rhum agricole) usa jugo de caña fresco y tiene un perfil herbáceo y terroso; el industrial usa melaza con un perfil más dulce." },
      { q: "¿Qué cóctel clásico lleva cachaça, lima y azúcar?", a: ["Caipirinha", "Caipiroska", "Mojito", "Daiquiri"], exp: "La Caipirinha es el cóctel nacional de Brasil: cachaça, lima cortada en trozos, azúcar blanco y hielo triturado." },
      { q: "¿Qué es el Falernum?", a: ["Sirope caribeño con lima, almendra y clavo", "Licor de coco jamaicano", "Ron con especias de Trinidad", "Bíter tropical de Barbados"], exp: "El Falernum es un sirope o licor de las Antillas con notas de lima, almendra, clavo y especias tropicales, esencial en los cócteles tiki." },
      { q: "¿Cuál es el cóctel tiki más famoso creado por Trader Vic?", a: ["Mai Tai", "Zombie", "Painkiller", "Jungle Bird"], exp: "Victor Bergeron 'Trader Vic' creó el Mai Tai en 1944 en Oakland, California, como homenaje a los sabores del Caribe." },
      { q: "¿Qué tipo de ron se usa en un Dark 'n' Stormy?", a: ["Ron oscuro de Bermuda (Gosling's)", "Ron blanco de Cuba", "Ron añejo jamaicano", "Ron especiado de las Barbados"], exp: "El Dark 'n' Stormy es una marca registrada de Gosling's de Bermuda: ron negro Gosling's y ginger beer." },
      { q: "¿Qué ingrediente es esencial en el cóctel 'Jungle Bird'?", a: ["Campari", "Aperol", "Licor de melocotón", "Blue Curaçao"], exp: "El Jungle Bird (1978, Kuala Lumpur) combina ron oscuro, Campari, zumo de piña, lime juice y sirope simple." }
    ]
  },
  {
    id: 7,
    title: "Ginebra & Tónica",
    subtitle: "El Botánico Perfecto",
    icon: "🌿",
    color: "#16a085",
    questions: [
      { q: "¿Qué es la London Dry Gin?", a: ["Estilo de ginebra sin azúcar añadido, destilada con botánicos naturales", "Ginebra producida solo en Londres", "Ginebra con predominio de cítricos", "Ginebra envejecida en barrica"], exp: "London Dry es un estilo (no un origen geográfico) que exige destilación con botánicos naturales, sin colorantes ni aromatizantes artificiales y mínimo azúcar añadido." },
      { q: "¿Por qué el agua tónica tiene sabor amargo?", a: ["Contiene quinina, originalmente antimalárica", "Lleva extracto de corteza de roble", "Tiene un alto contenido en bicarbonato", "Se elabora con agua mineral con azufre"], exp: "La quinina es el alcaloide de la corteza del árbol de quina que da su amargor característico a la tónica; los británicos en la India la usaban contra la malaria." },
      { q: "¿Qué es el sloe gin?", a: ["Licor de ginebra macerada con endrinas (sloe berries)", "Una ginebra seca y sin botánicos extra", "Ginebra de baja graduación", "Tipo de ginebra artesanal escocesa"], exp: "El sloe gin se elabora macerando endrinas (fruto del endrino) en ginebra con azúcar, produciendo un licor dulce y afrutado de color rojo." },
      { q: "¿Cuál es la diferencia entre Old Tom Gin y London Dry?", a: ["Old Tom es ligeramente más dulce; London Dry es seca", "Old Tom tiene más botánicos", "London Dry tiene más graduación", "Old Tom es de origen escocés"], exp: "Old Tom Gin, popular en el siglo XVIII, tiene un perfil más dulce que el London Dry moderno, siendo el eslabón entre el jenever holandés y la ginebra moderna." },
      { q: "¿Qué cóctel clásico lleva ginebra, zumo de limón, azúcar y soda?", a: ["Tom Collins", "Gimlet", "Southside", "Aviation"], exp: "El Tom Collins es un cóctel largo refrescante: ginebra (originalmente Old Tom), zumo de limón, sirope simple y agua con gas." },
      { q: "¿Qué hace especial a la 'Navy Strength Gin'?", a: ["Tiene una graduación de al menos 57% ABV", "Está envejecida en barrica naval", "Solo se produce en destilerías del Almirantazgo", "Contiene sal marina entre sus botánicos"], exp: "La ginebra Navy Strength (57% ABV) era la graduación que garantizaba que si se derramaba sobre la pólvora en los barcos de la Marina Real, esta aún podría encenderse." },
      { q: "¿Cuál es el botánico más utilizado en el Gin Tónica de estilo español?", a: ["Varía según el gin; enebro siempre presente", "Lavanda de Provenza", "Pimienta rosa exclusivamente", "Cardamomo verde"], exp: "España lideró el renacimiento del gin tónica, usando grandes balones de cristal, hielo en abundancia y botánicos variados que complementan el gin elegido." },
      { q: "¿En qué país se consume más ginebra per cápita?", a: ["Filipinas", "Reino Unido", "España", "Estados Unidos"], exp: "Filipinas es el mayor consumidor de ginebra per cápita del mundo, donde la marca Ginebra San Miguel domina el mercado." },
      { q: "¿Qué cóctel IBA lleva ginebra, zumo de lima o limón y crème de cassis?", a: ["Ninguno; el Aviation lleva crème de violette", "Gimlet", "Clover Club", "Bee's Knees"], exp: "El Aviation lleva ginebra, crème de violette, marrasquino y zumo de limón. El Clover Club lleva frambuesa. No confundir con crème de cassis (grosella negra)." },
      { q: "¿Qué es el jenever (genever)?", a: ["El antecesor holandés de la ginebra, más malteado y con más cuerpo", "Una ginebra alemana especiada", "Un tipo de aquavit de los Países Bajos", "Ginebra envejecida en Holanda"], exp: "El jenever holandés es el precursor histórico de la ginebra, con perfil más suave y malteado. Los soldados ingleses lo llamaban 'Dutch Courage' en el siglo XVII." }
    ]
  },
  {
    id: 8,
    title: "Whisky & Bourbon",
    subtitle: "La Nobleza de los Destilados",
    icon: "🥃",
    color: "#922b21",
    questions: [
      { q: "¿Qué significa 'single malt' en el Scotch Whisky?", a: ["Elaborado en una sola destilería con cebada malteada", "Destilado una sola vez", "Un único barril sin mezclar", "Producido solo en las Highlands"], exp: "Single Malt Scotch Whisky proviene de una única destilería, elaborado exclusivamente con cebada malteada y agua." },
      { q: "¿Qué estado de EE.UU. produce más del 90% del bourbon mundial?", a: ["Kentucky", "Tennessee", "Indiana", "Texas"], exp: "Kentucky es el corazón del bourbon, hogar de las destilerías más icónicas como Maker's Mark, Buffalo Trace y Woodford Reserve." },
      { q: "¿Qué es el 'angel's share'?", a: ["El alcohol que se evapora del barril durante el envejecimiento", "La parte que recibe el maestro destilador", "El primer destilado que se descarta", "El líquido que queda en el alambique"], exp: "El 'angel's share' (parte de los ángeles) es el porcentaje de whisky que se evapora anualmente a través del barril de madera, entre 2-5% por año." },
      { q: "¿Qué región escocesa es famosa por los whiskies turba dos e isleños?", a: ["Islay", "Speyside", "Highlands", "Lowlands"], exp: "Islay es la isla escocesa conocida por sus whiskies de intenso ahumado y turba, con destilerías como Laphroaig, Ardbeg y Bowmore." },
      { q: "¿Cuál es la diferencia entre el whisky Tennessee y el bourbon?", a: ["El Tennessee pasa por el proceso Lincoln County (filtrado con carbón de maple)", "El Tennessee se elabora en Tennessee y el bourbon en Kentucky", "El Tennessee tiene mayor contenido en maíz", "Solo difieren en el nombre comercial"], exp: "El Tennessee Whiskey (como Jack Daniel's) usa el Lincoln County Process: filtrado lento a través de carbón de maple antes del envejecimiento." },
      { q: "¿Qué cóctel clásico usa whisky de centeno (rye), vermut dulce y Angostura bitters?", a: ["Manhattan", "Old Fashioned", "Sazerac", "Whisky Sour"], exp: "El Manhattan es uno de los grandes cócteles americanos: rye whiskey o bourbon, vermut dulce y Angostura bitters, servido con una cereza." },
      { q: "¿Qué significa 'blended' en el whisky?", a: ["Mezcla de diferentes maltas y/o granos de varias destilerías", "Mezclado con agua antes de embotellar", "Un whisky con varios años de envejecimiento combinados", "Añejado en barricas de diferentes tipos de madera"], exp: "El whisky blended combina maltas de varias destilerías con whiskies de grano, buscando consistencia y equilibrio. Johnnie Walker es el más vendido del mundo." },
      { q: "¿En qué consiste el 'double distillation' del Scotch?", a: ["Destilación en alambiques de cobre dos veces para mayor pureza", "Envejecimiento en dos tipos de barrica", "Mezcla de dos destilados distintos", "Fermentación en dos fases"], exp: "La mayoría del Scotch single malt se destila dos veces en alambiques de olla de cobre (pot stills), concentrando los sabores y eliminando impurezas." },
      { q: "¿Qué cóctel lleva bourbon, azúcar, Angostura bitters y piel de naranja?", a: ["Old Fashioned", "Whisky Sour", "Mint Julep", "Boulevardier"], exp: "El Old Fashioned es uno de los cócteles más antiguos: azúcar, Angostura bitters, un chorro de agua, bourbon o rye, y piel de naranja." },
      { q: "¿Qué hace especial al whisky japonés?", a: ["Precisión, equilibrio y técnica japonesa; inspirado en Escocia pero con carácter único", "Solo usa agua de manantiales del Monte Fuji", "Siempre lleva un año de envejecimiento en barricas de cerezos", "Está hecho exclusivamente de arroz"], exp: "El whisky japonés, iniciado por Masataka Taketsuru y Shinjiro Torii en los años 20, combina la técnica escocesa con la filosofía japonesa de precisión y armonía." }
    ]
  },
  {
    id: 9,
    title: "Mixología Moderna",
    subtitle: "Tendencias del Siglo XXI",
    icon: "⚗️",
    color: "#1abc9c",
    questions: [
      { q: "¿Qué es el Aperol Spritz?", a: ["Aperol, prosecco y soda con naranja", "Campari, vino blanco y lima", "Aperol, ginebra y agua con gas", "Aperol, vermut y hielo"], exp: "El Aperol Spritz es la receta 3-2-1: 3 partes de prosecco, 2 de Aperol, 1 de soda, con naranja. Fenómeno global de los últimos años." },
      { q: "¿Qué es la mixología molecular?", a: ["Aplicar técnicas y ciencia gastronómica a la elaboración de cócteles", "Mezclar solo moléculas de alcohol puro", "Coctelería sin hielo usando tecnología criogénica", "Cócteles solo a base de agua mineral"], exp: "La mixología molecular usa herramientas de la cocina de vanguardia (esferificación, gelificación, aires, nitrógeno líquido) para crear cócteles innovadores." },
      { q: "¿Qué es un cóctel 'clarificado' con leche?", a: ["Cóctel lavado con leche para obtener un líquido transparente y sedoso", "Cóctel con leche fresca añadida al final", "Un batido de cóctel y leche", "Un long drink con leche descremada"], exp: "El milk punch clarificado usa la proteína de la leche para capturar las partículas de turbidez. La leche cuaja, se filtra y el resultado es un cóctel cristalino y suave." },
      { q: "¿Qué es el 'shrub' en coctelería moderna?", a: ["Sirope a base de vinagre, fruta y azúcar", "Un tipo de menta molida", "Hierbas maceradas en alcohol", "Zumo de fruta fermentado"], exp: "El shrub (o drinking vinegar) es un concentrado de vinagre, fruta y azúcar que añade acidez compleja y matices a los cócteles sin usar cítricos." },
      { q: "¿Qué es el movimiento 'low and no' en coctelería?", a: ["Tendencia de cócteles con bajo o nulo contenido alcohólico", "Cócteles con poca o ninguna azúcar", "Reducción del número de ingredientes al mínimo", "Bebidas con bajo precio y sin marcas"], exp: "El movimiento low-ABV y sin alcohol responde a la creciente demanda de alternativas para quienes no consumen alcohol o quieren moderar su consumo." },
      { q: "¿Qué es el 'umami' en el contexto de la coctelería?", a: ["El quinto sabor básico (salado-proteico) que añade profundidad al cóctel", "Un tipo de bíter japonés", "Técnica de equilibrio entre dulce y amargo", "Un destilado de algas japonesas"], exp: "El umami es el quinto sabor básico. En coctelería se consigue con ingredientes como salsa de soja, kombu, tomate seco o miso para añadir profundidad y redondez." },
      { q: "¿Qué es el 'batch cocktail'?", a: ["Cóctel preparado en grandes cantidades de antemano para servir rápidamente", "Un cóctel elaborado con un solo espíritu", "Cóctel con múltiples capas visibles", "Un cóctel para compartir entre varios"], exp: "Los batch cocktails son mezclas preparadas en botella o contenedor con antelación, diluidas y equilibradas, listas para servir sin mezclar al momento." },
      { q: "¿Qué técnica es el 'nitro'?", a: ["Añadir nitrógeno líquido o servir en grifo con nitrógeno para textura sedosa y frío extremo", "Infusionar con óxido nitroso (N2O)", "Usar hielo seco en la presentación", "Refrigeración ultra rápida con carbono"], exp: "El nitrógeno líquido en coctelería crea efectos espectaculares de vapor y enfría instantáneamente. Los grifos de nitrógeno dan textura cremosa a café y cócteles." },
      { q: "¿Cuál es el cóctel 'Paper Plane' y qué lo caracteriza?", a: ["Partes iguales de bourbon, Aperol, Amaro Nonino y zumo de limón", "Ginebra, Aperol, prosecco y limón", "Bourbon, triple sec, Campari y lima", "Whisky de centeno, Fernet, Aperol y zumo de naranja"], exp: "El Paper Plane, creado por Sam Ross en 2008, es un modelo de equilibrio perfecto: 3/4 oz de bourbon, Aperol, Amaro Nonino y zumo de limón." },
      { q: "¿Qué es el 'terroir' aplicado a los destilados?", a: ["El conjunto de factores geográficos, climáticos y de suelo que influyen en el sabor del destilado", "La técnica de añejamiento en el lugar de producción", "Solo el tipo de agua usada en la destilación", "El método de cosecha de la materia prima"], exp: "Como en el vino, el terroir en destilados describe cómo el suelo, clima, agua local y microbioma influyen en el sabor final del espíritu, especialmente en tequila, whisky y rhum agricole." }
    ]
  },
  {
    id: 10,
    title: "Gran Maestro",
    subtitle: "El Desafío Final",
    icon: "👑",
    color: "#d4a017",
    questions: [
      { q: "¿Qué es el Negroni Sbagliato y qué lo diferencia del Negroni clásico?", a: ["Usa prosecco en lugar de ginebra; sbagliato significa 'error' en italiano", "Lleva vodka en lugar de ginebra", "Se sirve con gin tónica en lugar de con hielo", "Es un Negroni sin Campari"], exp: "El Negroni Sbagliato ('equivocado' en italiano) surgió cuando un bartender del Bar Basso de Milán usó prosecco por error en lugar de ginebra; el error fue un éxito." },
      { q: "¿Cuál es la proporción exacta de un Daiquiri clásico IBA?", a: ["6 cl de ron blanco, 2 cl de triple sec, 1.5 cl de zumo de lima", "3 cl de ron, 3 cl de lima, 1 cl de azúcar", "4.5 cl de ron, 2.5 cl de lima, 1.5 cl de sirope", "2 oz de ron, 1 oz de lima, 0.5 oz de sirope"], exp: "El Daiquiri IBA oficial: 6 cl de ron blanco, 2 cl de triple sec o curaçao, 1.5 cl de zumo de lima fresco. Servido en copa de cóctel." },
      { q: "¿Qué cóctel lleva tanto whisky de centeno como cognac?", a: ["Vieux Carré", "Manhattan", "Sidecar", "Sazerac"], exp: "El Vieux Carré, creado en el Hotel Monteleone de Nueva Orleans, lleva rye whiskey, cognac, vermut dulce, Bénédictine y dos tipos de bitters." },
      { q: "¿Qué es el Hanky Panky?", a: ["Ginebra, vermut dulce y Fernet-Branca", "Vodka, licor de cereza y soda", "Bourbon, Aperol y angostura", "Ginebra, Campari y zumo de pomelo"], exp: "El Hanky Panky fue creado por Ada Coleman del Savoy Hotel en Londres alrededor de 1900: ginebra, vermut dulce y un toque de Fernet-Branca." },
      { q: "¿Qué es la crème de violette?", a: ["Licor de flores de violeta, esencial en el Aviation", "Crema de postre con sabor floral", "Sirope francés de frutos del bosque", "Un bíter de violeta austríaco"], exp: "La crème de violette es un licor elaborado con flores de violeta. Es el ingrediente que da el color malva característico al cóctel Aviation y que escaseó durante décadas." },
      { q: "¿Cuáles son los cuatro ingredientes del 'Naked and Famous'?", a: ["Mezcal, Aperol, Yellow Chartreuse y zumo de lima a partes iguales", "Tequila, Campari, Cointreau y lima", "Mezcal, Aperol, Fernet y limón", "Gin, Yellow Chartreuse, Aperol y pomelo"], exp: "El Naked and Famous, creado por Joaquín Simó en 2011 en Nueva York, es otro cóctel a partes iguales: mezcal joven, Aperol, Yellow Chartreuse y zumo de lima." },
      { q: "¿Qué técnica es la 'esferificación básica' aplicada a un cóctel?", a: ["Crear esferas de líquido coctelero que estallan al comerlas usando alginato y cloruro cálcico", "Servir el cóctel dentro de una esfera de hielo", "Presentar el cóctel en una bola de chocolate", "Usar esferas de hielo de 60mm para un Old Fashioned"], exp: "La esferificación básica, popularizada por Ferran Adrià, usa alginato de sodio y cloruro cálcico para crear esferas con membrana fina que contienen líquido y estallan en la boca." },
      { q: "¿Cuándo se considera que un vermut es 'extra dry'?", a: ["Cuando contiene menos de 30 gramos de azúcar por litro", "Cuando está envejecido menos de 1 mes", "Cuando tiene más del 20% de ABV", "Cuando se elabora sin botánicos dulces"], exp: "El vermut extra dry (muy seco) tiene un contenido en azúcar muy bajo (inferior a 30 g/l), siendo el más seco de todas las categorías de vermut." },
      { q: "¿Qué hace especial al cóctel 'Clover Club'?", a: ["Contiene clara de huevo que le da una textura espumosa", "Lleva cuatro tipos de espíritus", "Se sirve en cuatro copas a la vez", "Tiene cuatro capas de colores distintos"], exp: "El Clover Club (pre-Prohibition) lleva ginebra, zumo de limón, sirope de frambuesa y clara de huevo batido, que le da su característica textura espumosa y apariencia rosada." },
      { q: "¿Qué destilería escocesa fue la primera en embotellar single malt Scotch para el mercado mundial?", a: ["Glenfiddich (1963)", "Macallan (1970)", "Laphroaig (1950)", "Balvenie (1973)"], exp: "Glenfiddich lanzó en 1963 el primer single malt Scotch Whisky comercializado activamente en el mercado internacional, cambiando la industria para siempre." }
    ]
  },
  {
    id: 11,
    title: "Organización IBA y servicio",
    subtitle: "Misión, formación y ética del bartender",
    icon: "🏛️",
    color: "#2c3e50",
    questions: [
      { q: "¿Cuál es la misión principal de la IBA?", a: ["Conectar, formar e inspirar a bartenders de todo el mundo", "Regular las ventas de alcohol a nivel global", "Organizar únicamente competiciones de cócteles", "Certificar bares y restaurantes"], exp: "La misión principal de la IBA es conectar, formar e inspirar a bartenders de todo el mundo, fomentando la excelencia en la profesión." },
      { q: "¿Cuáles son los valores fundamentales de la IBA?", a: ["Unidad, pasión y legado", "Tradición, innovación y calidad", "Conocimiento, servicio y beneficio", "Creatividad, velocidad y precisión"], exp: "Los valores fundamentales de la IBA son unidad, pasión y legado, que reflejan su compromiso con la comunidad global de bartenders." },
      { q: "¿Cuántos cursos forman la Pirámide Educativa IBA?", a: ["10", "5", "8", "12"], exp: "La Pirámide Educativa IBA está formada por 10 cursos que trazan un camino estructurado para la formación del bartender." },
      { q: "¿Cuál es el objetivo de la IBA Academy?", a: ["Ofrecer formación y conocimiento a bartenders de todo el mundo", "Vender material de coctelería", "Conceder licencias a bares internacionales", "Publicar libros de recetas de cócteles"], exp: "La IBA Academy busca ofrecer formación y conocimiento a bartenders de todo el mundo, elevando el nivel profesional." },
      { q: "¿Qué curso está diseñado para bartenders noveles?", a: ["IBA Foundation Course (IFC)", "IBA Master Course", "IBA Advanced Mixology", "IBA Sommelier Course"], exp: "El IBA Foundation Course (IFC) está diseñado específicamente para bartenders noveles que se inician en la profesión." },
      { q: "¿Cuál es la duración del curso ICB?", a: ["40 horas", "20 horas", "60 horas", "80 horas"], exp: "El curso ICB tiene una duración de 40 horas entre teoría y práctica." },
      { q: "¿Quién puede impartir cursos IBA tras completar el TTT?", a: ["Quien tenga amplia experiencia y haya completado al menos 3 cursos", "Cualquier miembro de la IBA", "Sólo los miembros de la junta de la IBA", "Cualquiera con licencia de bartender"], exp: "Tras completar el programa Train The Trainer (TTT), sólo quienes tienen amplia experiencia y han completado al menos 3 cursos pueden impartir cursos IBA." },
      { q: "¿Qué se celebra el 24 de febrero?", a: ["El Día Internacional del Bartender", "El Día Mundial del Cóctel", "El Día de la Fundación de la IBA", "El Día Mundial de los Destilados"], exp: "El 24 de febrero se celebra el Día Internacional del Bartender, en homenaje a los bartenders de todo el mundo." },
      { q: "¿Qué ocurre si un estudiante infringe el código IBA?", a: ["Puede ser expulsado sin derecho a devolución", "Recibe una carta de aviso", "Debe repetir el curso", "Tiene que pagar una sanción"], exp: "Si un estudiante infringe el código de conducta de la IBA puede ser expulsado del programa sin derecho a devolución." },
      { q: "¿Cuál es el objetivo principal de un bartender?", a: ["Crear la mejor experiencia posible para el cliente", "Vender las bebidas más caras", "Memorizar todas las recetas de cócteles", "Trabajar lo más rápido posible"], exp: "El objetivo principal de un bartender es crear la mejor experiencia posible para el cliente a través de la hospitalidad y el conocimiento." }
    ]
  },
  {
    id: 12,
    title: "Bartenders famosos y leyendas del cóctel",
    subtitle: "Pioneros del mundo de la coctelería",
    icon: "🎩",
    color: "#7d3c98",
    questions: [
      { q: "¿Qué deben evitar los bartenders al manipular la cristalería?", a: ["Tocar el borde del vaso", "Usar una bandeja para transportar vasos", "Pulir los vasos con un paño", "Coger las copas por el pie"], exp: "Por higiene, un bartender nunca debe tocar el borde del vaso, porque es la zona que tocarán los labios del cliente." },
      { q: "¿Cómo debe interactuar un bartender con el cliente?", a: ["Entablando conversación ligera y ofreciendo recomendaciones", "Ignorarle salvo que hable primero", "Hablar sólo de la carta", "Evitar cualquier interacción personal"], exp: "Un buen bartender interactúa con el cliente entablando conversación ligera y ofreciéndole recomendaciones personalizadas para mejorar su experiencia." },
      { q: "¿Cómo puede un bartender mejorar la experiencia del cliente?", a: ["Usando su conocimiento para recomendar cócteles", "Sirviendo las bebidas lo más rápido posible", "Ofreciendo descuentos en cada pedido", "Memorizando el nombre de cada cliente"], exp: "El bartender mejora la experiencia del cliente usando su conocimiento y criterio para recomendar cócteles que encajen con sus gustos." },
      { q: "¿Quién dirigió el American Bar del Savoy entre 1926 y 1934?", a: ["Harry Craddock", "Jerry Thomas", "Dale DeGroff", "Dick Bradsell"], exp: "Harry Craddock fue el jefe de barra del American Bar del Savoy de Londres entre 1926 y 1934." },
      { q: "¿Qué libro publicó Harry Craddock en 1930?", a: ["The Savoy Cocktail Book", "The Bartender's Guide", "The Fine Art of Mixing Drinks", "Vintage Spirits and Forgotten Cocktails"], exp: "Harry Craddock publicó The Savoy Cocktail Book en 1930, uno de los libros de coctelería más influyentes jamás escritos." },
      { q: "¿Quién está considerado el padre del estilo tiki?", a: ["Donn Beach", "Trader Vic", "Jerry Thomas", "Harry Craddock"], exp: "Donn Beach (Ernest Raymond Beaumont Gantt) está considerado el padre de la cultura tiki; abrió el primer bar tiki en 1933." },
      { q: "¿Qué cóctel se atribuye a Victor Bergeron (Trader Vic)?", a: ["Mai Tai", "Zombie", "Piña Colada", "Singapore Sling"], exp: "A Victor Bergeron, conocido como Trader Vic, se le atribuye la creación del Mai Tai en 1944." },
      { q: "¿Por qué es conocido Patrick Gavin Duffy?", a: ["Por servir copas a personalidades famosas", "Por inventar la coctelera", "Por escribir el primer manual de bar", "Por crear el Martini"], exp: "Patrick Gavin Duffy fue conocido por servir copas a personalidades famosas y por ser una figura destacada de la escena bartender de Nueva York." },
      { q: "¿Qué proporción (1:2:8) describió David Embury?", a: ["Sour", "Old Fashioned", "Martini", "Manhattan"], exp: "En 'The Fine Art of Mixing Drinks' (1948), David Embury definió el Sour con 1 parte de dulce, 2 de ácido y 8 de destilado." },
      { q: "¿Qué premio recibió Santiago Policastro?", a: ["El Oso de Berna", "El Shaker de Oro", "La Medalla del Bartender", "El IBA Lifetime Achievement"], exp: "Santiago Policastro recibió El Oso de Berna, un reconocimiento prestigioso en el mundo de la coctelería." }
    ]
  },
  {
    id: 13,
    title: "Pioneros de la coctelería moderna",
    subtitle: "Innovadores de la mixología contemporánea",
    icon: "🌟",
    color: "#e74c3c",
    questions: [
      { q: "¿Qué fundó Pedro Chicote en 1964?", a: ["La Asociación de Barmans Españoles (ABE)", "La primera escuela de coctelería de España", "La Academia de Barra de Madrid", "El Consejo Español de Destilados"], exp: "Pedro Chicote fundó la Asociación de Barmans Españoles (ABE) en 1964, organizando la profesión del bartender en España." },
      { q: "¿A quién se conoce como 'King Cocktail'?", a: ["Dale DeGroff", "Jerry Thomas", "Harry Craddock", "Gary Regan"], exp: "Dale DeGroff se ganó el apodo 'King Cocktail' por su papel en la recuperación de la cultura del cóctel clásico en el Rainbow Room de Nueva York." },
      { q: "¿Quién era Sasha Petraske?", a: ["Un mixólogo estadounidense", "Un destilador ruso de vodka", "Un sommelier francés", "Un propietario de pub británico"], exp: "Sasha Petraske fue un influyente mixólogo estadounidense que cambió la escena moderna del cóctel." },
      { q: "¿Qué bar fundó Sasha Petraske en 1999?", a: ["Milk & Honey", "Death & Co", "PDT", "Angel's Share"], exp: "Sasha Petraske fundó Milk & Honey en 1999 en Nueva York, siendo pionero del movimiento moderno de los speakeasy." },
      { q: "¿Cuál era la filosofía de coctelería de Sasha Petraske?", a: ["Menos es más", "Más es más", "Rapidez antes que calidad", "Innovación por encima de la tradición"], exp: "La filosofía de Petraske, 'menos es más', ponía énfasis en la sencillez, los ingredientes de calidad y la técnica impecable." },
      { q: "¿A quién se conoce como 'Dr. Cocktail'?", a: ["Ted Haigh", "Dave Arnold", "Robert Hess", "Jeffrey Morgenthaler"], exp: "Ted Haigh es conocido como 'Dr. Cocktail' por sus investigaciones sobre cócteles antiguos e historia de los destilados." },
      { q: "¿Qué defiende Robert Hess?", a: ["Los cócteles artesanos", "La coctelería de velocidad", "Sólo la mixología molecular", "Los cócteles premezclados"], exp: "Robert Hess es un firme defensor de los cócteles artesanos y de las técnicas correctas de coctelería." },
      { q: "¿Qué bar abrió Audrey Saunders?", a: ["The Pegu Club", "Milk & Honey", "Death & Co", "Employees Only"], exp: "Audrey Saunders abrió The Pegu Club en Nueva York, uno de los bares de cócteles más influyentes de los años 2000." },
      { q: "¿Cuál es la innovación más destacada de Jeffrey Morgenthaler?", a: ["Envejecer cócteles en barrica", "Las decoraciones moleculares", "Las bebidas infusionadas con nitrógeno", "Los vasos de cóctel comestibles"], exp: "A Jeffrey Morgenthaler se le atribuye la popularización del envejecimiento de cócteles en barrica, una técnica que aporta profundidad y complejidad." },
      { q: "¿Por qué equipo de alta tecnología es conocido Dave Arnold?", a: ["Centrifugadoras", "Impresoras 3D", "Cortadoras láser", "Limpiadores ultrasónicos"], exp: "Dave Arnold es conocido por usar centrifugadoras y otros equipos de alta tecnología para empujar los límites de la coctelería en Booker and Dax." }
    ]
  },
  {
    id: 14,
    title: "Utensilios y operaciones de bar",
    subtitle: "Equipamiento, higiene y tipos de barra",
    icon: "🍶",
    color: "#2ecc71",
    questions: [
      { q: "¿Qué significa 'mise en place'?", a: ["Cada cosa en su sitio", "Listo para servir", "Limpio y ordenado", "Tiempo de preparación"], exp: "'Mise en place' es un término francés que significa 'cada cosa en su sitio' y hace referencia a tener preparados y organizados los utensilios e ingredientes antes del servicio." },
      { q: "¿Cuál es la diferencia entre un garnish y una decoración?", a: ["El garnish aporta sabor; la decoración aporta apariencia", "Son lo mismo", "El garnish es comestible y la decoración no", "La decoración siempre es a base de fruta"], exp: "El garnish cumple una función al realzar el sabor de la bebida, mientras que la decoración es puramente estética." },
      { q: "¿Cómo deben lavarse las manos en un bar?", a: ["Con agua caliente y jabón", "Sólo con agua fría", "Sólo con gel hidroalcohólico", "Con un paño seco"], exp: "La higiene correcta de manos exige lavado con agua caliente y jabón para eliminar bacterias y cumplir los estándares de seguridad alimentaria." },
      { q: "¿Cómo deben almacenarse los productos químicos en un bar?", a: ["Separados de cualquier otro líquido", "Junto a los destilados para tenerlos a mano", "Bajo la barra", "En el mismo almacén que los refrescos"], exp: "Los productos químicos deben guardarse separados del resto de líquidos para evitar contaminación y garantizar la seguridad." },
      { q: "¿Para qué sirve un colador Hawthorne?", a: ["Colar sólidos de los cócteles", "Medir porciones de líquido", "Picar hielo", "Abrir botellas"], exp: "El colador Hawthorne, con su característico muelle, sirve para colar sólidos como hielo o fruta al servir un cóctel." },
      { q: "¿Qué utensilio se usa para medir líquidos en coctelería?", a: ["Jigger", "Muddler", "Cucharilla de bar", "Colador"], exp: "El jigger es el utensilio estándar con el que el bartender mide líquidos de forma precisa y consistente." },
      { q: "¿Qué hace una coctelera?", a: ["Enfría cócteles que contienen zumos y destilados", "Sólo mezcla los ingredientes", "Gasifica la bebida", "Filtra las impurezas"], exp: "La coctelera enfría y mezcla cócteles, sobre todo los que contienen zumos y destilados, mediante una agitación enérgica con hielo." },
      { q: "¿Cuál es el uso del muddler?", a: ["Machacar azúcar y frutas", "Remover cócteles", "Medir ingredientes", "Colar bebidas"], exp: "El muddler se usa para machacar azúcar, frutas y hierbas y liberar sus sabores y jugos en el cóctel." },
      { q: "¿Cuál es la característica de un wine bar?", a: ["Se centra exclusivamente en vino y productos relacionados", "Sirve todo tipo de destilados por igual", "Siempre está en un hotel", "Debe tener un sommelier en plantilla"], exp: "Un wine bar se caracteriza por centrarse exclusivamente en el vino y los productos relacionados, con una amplia carta de vinos." },
      { q: "¿Cómo sirve las bebidas un dispense bar?", a: ["A través de un camarero o camarera", "Directamente al cliente en la barra", "Mediante una máquina expendedora", "A través de un pedido por app"], exp: "Un dispense bar sirve las bebidas a través de un tercero (camarero o camarera) en vez de directamente al cliente en la barra." }
    ]
  },
  {
    id: 15,
    title: "Tea, Coffee & Sugars",
    subtitle: "Essential Bar Beverages & Sweeteners",
    icon: "☕",
    color: "#6d4c41",
    questions: [
      { q: "What is a synonym for saccharide?", a: ["Carbohydrate", "Protein", "Lipid", "Mineral"], exp: "Saccharide is a synonym for carbohydrate, the chemical family that includes all sugars." },
      { q: "What is the most common sugar used in drinks?", a: ["Sucrose", "Fructose", "Glucose", "Lactose"], exp: "Sucrose (table sugar) is the most common sugar used in drink preparation and cocktail making." },
      { q: "What is the primary use of glucose?", a: ["Providing energy", "Adding flavor", "Preserving food", "Coloring drinks"], exp: "Glucose is primarily used by the body as an energy source and is the simplest form of sugar." },
      { q: "Where is stevia derived from?", a: ["Stevia plant leaves", "Sugarcane roots", "Corn kernels", "Honey bees"], exp: "Stevia is a natural sweetener derived from the leaves of the Stevia rebaudiana plant, native to South America." },
      { q: "How is matcha traditionally prepared?", a: ["Whisking powdered tea with hot water", "Steeping tea leaves in boiling water", "Brewing in a coffee machine", "Cold-pressing tea leaves"], exp: "Matcha is traditionally prepared by whisking the fine powdered green tea with hot water using a bamboo whisk (chasen)." },
      { q: "What is a characteristic of black tea?", a: ["100% oxidized", "0% oxidized", "50% oxidized", "Fermented with bacteria"], exp: "Black tea is fully (100%) oxidized, which gives it its dark color and strong, robust flavor profile." },
      { q: "Where did coffee originate?", a: ["Ethiopia", "Brazil", "Colombia", "Yemen"], exp: "Coffee originated in Ethiopia, where legend says a goat herder named Kaldi discovered the energizing effects of coffee berries." },
      { q: "What is the most commercially grown coffee species?", a: ["Arabica", "Robusta", "Liberica", "Excelsa"], exp: "Arabica is the most commercially grown and consumed coffee species, accounting for about 60-70% of world production." },
      { q: "What is the 'crema' in espresso?", a: ["The layer of golden-brown foam on top", "The coffee grounds residue", "The milk froth added on top", "The sugar dissolved in the cup"], exp: "Crema is the layer of golden-brown foam that forms on top of a properly extracted espresso, indicating freshness and quality." },
      { q: "What is a ristretto?", a: ["A restricted pour with more concentrated flavor", "A double shot of espresso", "An espresso with extra water", "A cold-brewed espresso"], exp: "A ristretto is a 'restricted' espresso shot using less water, resulting in a more concentrated and intense flavor." }
    ]
  },
  {
    id: 16,
    title: "Historia de la destilación y la cerveza",
    subtitle: "Orígenes de los destilados y la cerveza",
    icon: "⚗️",
    color: "#795548",
    questions: [
      { q: "¿Dónde tuvo lugar la destilación más antigua?", a: ["En China", "En Egipto", "En Grecia", "En Mesopotamia"], exp: "Las primeras evidencias de destilación se remontan a la antigua China, donde se desarrolló la técnica por primera vez." },
      { q: "¿Qué es la destilación?", a: ["Separar un líquido por evaporación y condensación", "Fermentar granos con levadura", "Filtrar impurezas del agua", "Mezclar varios destilados"], exp: "La destilación es el proceso de separar los componentes de una mezcla líquida mediante evaporación y condensación selectivas." },
      { q: "¿A quién se atribuye la invención del alambique?", a: ["María la Judía", "Jabir ibn Hayyan", "Aristóteles", "Hipócrates"], exp: "A María la Judía (Maria Hebraea) se le atribuye la invención del alambique, uno de los primeros aparatos de destilación." },
      { q: "¿Qué invento clave de la destilación apareció en el siglo XI?", a: ["El serpentín de refrigeración", "El alambique de cobre", "El alambique de columna", "El condensador de reflujo"], exp: "El serpentín de refrigeración se inventó en el siglo XI y mejoró enormemente la eficacia de la destilación." },
      { q: "¿A qué hacía referencia el término 'agua de la vida'?", a: ["A los primeros destilados", "A un tipo de agua bendita", "Al agua de manantial para destilar", "A un medicamento medieval"], exp: "'Agua de la vida' (aqua vitae en latín, uisce beatha en gaélico) fue el primer término usado para referirse a los destilados." },
      { q: "¿Cuál es el mejor metal para destilar?", a: ["Cobre", "Acero inoxidable", "Hierro", "Aluminio"], exp: "El cobre se considera el mejor metal para destilar porque retira los compuestos de azufre y da destilados más limpios y sabrosos." },
      { q: "¿Quién documentó la elaboración de cerveza por primera vez?", a: ["Los egipcios", "Los griegos", "Los romanos", "Los chinos"], exp: "Los egipcios fueron los primeros en dejar constancia escrita de la elaboración de cerveza; hay registros de milenios de antigüedad." },
      { q: "¿Cuál era la principal fuente de azúcar fermentable en la cerveza antigua?", a: ["La cebada malteada", "La miel", "Las uvas", "La caña de azúcar"], exp: "La cebada malteada fue la fuente principal de azúcar fermentable para elaborar cerveza en la antigüedad." },
      { q: "¿Quién introdujo el lúpulo en la cerveza?", a: ["Los monjes alemanes", "Los granjeros ingleses", "Los cerveceros belgas", "Los comerciantes checos"], exp: "Los monjes alemanes introdujeron el lúpulo en la cerveza, aportando amargor, aroma y propiedades conservantes." },
      { q: "¿Cuánto duró la Ley Seca en Estados Unidos?", a: ["1920-1933", "1910-1925", "1925-1940", "1915-1930"], exp: "La Ley Seca en Estados Unidos duró de 1920 a 1933 y prohibía la fabricación, venta y transporte de bebidas alcohólicas." }
    ]
  },
  {
    id: 17,
    title: "Cerveza",
    subtitle: "Elaboración, conservación y servicio",
    icon: "🍺",
    color: "#f39c12",
    questions: [
      { q: "¿Para qué sirve el lúpulo en la cerveza?", a: ["Aportar amargor y aroma", "Añadir dulzor", "Aumentar el grado alcohólico", "Clarificar la cerveza"], exp: "El lúpulo aporta amargor para equilibrar el dulzor de la malta, además de contribuir al aroma y sabor de la cerveza." },
      { q: "¿Qué transforma el proceso de malteado?", a: ["El almidón en azúcares solubles", "El azúcar en alcohol", "El agua en vapor", "Las proteínas en aminoácidos"], exp: "El malteado convierte el almidón de los granos en azúcares solubles que luego la levadura puede fermentar." },
      { q: "¿Qué caracteriza a la levadura de fermentación baja?", a: ["Se deposita en el fondo del tanque", "Flota sobre el mosto", "Trabaja a temperatura ambiente", "Genera sabores afrutados"], exp: "La levadura de fermentación baja (la de las lager) se deposita en el fondo del tanque y trabaja a temperaturas más bajas." },
      { q: "¿Qué efecto tiene la maduración en la cerveza?", a: ["La vuelve más suave y clara", "Aumenta su amargor", "Le añade más carbonatación", "Oscurece su color"], exp: "La maduración (o 'conditioning') hace la cerveza más suave y clara a medida que los sabores se integran y las partículas sedimentan." },
      { q: "¿Para qué sirve la pasteurización de la cerveza?", a: ["Prolongar su vida útil", "Mejorar el sabor", "Aumentar el grado alcohólico", "Añadir carbonatación"], exp: "La pasteurización prolonga la vida útil de la cerveza al eliminar bacterias y levaduras que podrían estropearla." },
      { q: "¿Qué es la cerveza?", a: ["Un producto perecedero elaborado con granos, levaduras y lúpulo", "Un destilado de cebada", "Un vino fermentado de uva", "Un refresco gaseoso con alcohol"], exp: "La cerveza es un producto perecedero elaborado a partir de granos (habitualmente cebada), levaduras, lúpulo y agua mediante fermentación." },
      { q: "¿Cuál es la mejor temperatura de almacenamiento para la cerveza?", a: ["4°-21°C", "0°-2°C", "25°-30°C", "-5°-0°C"], exp: "La cerveza se conserva entre 4° y 21°C según el estilo, para mantener calidad y sabor." },
      { q: "¿Por qué se usan botellas oscuras para la cerveza?", a: ["Para protegerla de la luz", "Para mantenerla más fría", "Sólo por estética", "Para impedir la entrada de oxígeno"], exp: "Las botellas oscuras protegen la cerveza del daño por luz (lightstrike), que genera el característico sabor 'a mofeta' al degradar la luz UV los compuestos del lúpulo." },
      { q: "¿Qué indica una espuma densa e irregular en la cerveza?", a: ["Carbonatación natural", "Exceso de carbonatación", "Cerveza pasada", "Carbonatación artificial"], exp: "Una espuma densa e irregular indica carbonatación natural, frente a las burbujas uniformes de la carbonatación forzada." },
      { q: "¿Cuál es la temperatura ideal de servicio de una lager europea?", a: ["7° a 9°C", "0° a 3°C", "12° a 15°C", "3° a 5°C"], exp: "Las lager europeas se sirven idealmente entre 7° y 9°C para expresar mejor sus sabores limpios y frescos." }
    ]
  },
  {
    id: 18,
    title: "Wine Fundamentals",
    subtitle: "Grapes, Regions & Winemaking",
    icon: "🍷",
    color: "#8e24aa",
    questions: [
      { q: "What grape variety family is primarily used for white wine?", a: ["Vitis vinifera", "Vitis labrusca", "Vitis rotundifolia", "Vitis riparia"], exp: "Vitis vinifera is the primary grape species used for producing quality white (and red) wines worldwide." },
      { q: "Which grape is known for high acidity?", a: ["Sauvignon Blanc", "Muscat", "Gewürztraminer", "Viognier"], exp: "Sauvignon Blanc is known for its high acidity, producing crisp, refreshing wines with citrus and herbaceous notes." },
      { q: "What does 'vintage' mean in wine terminology?", a: ["The year grapes are harvested", "The age of the winery", "The quality rating of the wine", "The region where wine is made"], exp: "In wine terminology, 'vintage' refers to the year in which the grapes were harvested, indicating the growing conditions of that year." },
      { q: "Which of these is a red wine grape?", a: ["Merlot", "Chardonnay", "Riesling", "Sauvignon Blanc"], exp: "Merlot is one of the world's most popular red wine grapes, known for its soft, plummy character." },
      { q: "What is the purpose of canopy management in viticulture?", a: ["To regulate sunlight exposure", "To prevent rainfall", "To increase grape size", "To reduce harvest time"], exp: "Canopy management regulates sunlight exposure to the grapes, affecting ripeness, flavor development, and disease prevention." },
      { q: "What does 'Blanc de Blancs' mean?", a: ["Made from white grapes", "White wine from red grapes", "Blended white wine", "First pressing only"], exp: "Blanc de Blancs means 'white from whites,' indicating a wine (often Champagne) made exclusively from white grapes, typically Chardonnay." },
      { q: "What grapes are used in Blanc de Noirs?", a: ["Pinot Noir and Pinot Meunier", "Chardonnay and Riesling", "Sauvignon Blanc and Sémillon", "Muscat and Viognier"], exp: "Blanc de Noirs ('white from blacks') is made from dark-skinned grapes, primarily Pinot Noir and Pinot Meunier in Champagne." },
      { q: "What does AOC stand for?", a: ["Appellation d'Origine Contrôlée", "Association of Oenological Control", "Appellation of Original Character", "Alliance of Organic Cellars"], exp: "AOC stands for Appellation d'Origine Contrôlée, the French system of quality and origin control for wines and other products." },
      { q: "Which French region is famous for sparkling wine?", a: ["Champagne", "Bordeaux", "Burgundy", "Loire Valley"], exp: "Champagne is the most famous French region for sparkling wine. Only sparkling wine from this region can legally be called Champagne." },
      { q: "What is the primary grape of Rioja?", a: ["Tempranillo", "Garnacha", "Graciano", "Mazuelo"], exp: "Tempranillo is the primary grape variety of Rioja, Spain's most prestigious wine region." }
    ]
  },
  {
    id: 19,
    title: "Fortified Wines & Vermouth",
    subtitle: "Sherry, Madeira, Port & Vermouth",
    icon: "🍾",
    color: "#c0392b",
    questions: [
      { q: "Which grape is used for sweet sherry?", a: ["Pedro Ximenez", "Palomino Fino", "Muscat", "Tempranillo"], exp: "Pedro Ximenez (PX) grapes are sun-dried to concentrate their sugars and used to produce intensely sweet sherries." },
      { q: "What is the blending system used in sherry production?", a: ["Solera system", "Méthode champenoise", "Assemblage", "Cuvée system"], exp: "The Solera system is a fractional blending system where older wines are gradually blended with younger wines to achieve consistency." },
      { q: "How is Fino sherry aged?", a: ["Under flor", "In new oak barrels", "In stainless steel tanks", "Through oxidative aging"], exp: "Fino sherry is aged under a layer of flor (a film of yeast) that protects the wine from oxidation, keeping it light and dry." },
      { q: "What is the driest style of Madeira wine?", a: ["Sercial", "Malmsey", "Bual", "Verdelho"], exp: "Sercial is the driest style of Madeira wine, with high acidity and a lighter body." },
      { q: "What is the estufado process in Madeira production?", a: ["Heating barrels to accelerate maturation", "Cold stabilization of wine", "Fortification with brandy", "Blending different vintages"], exp: "Estufado (or estufagem) is the process of heating Madeira wine in barrels to accelerate maturation, giving it its distinctive caramelized character." },
      { q: "What are vermouths classified as?", a: ["Fortified wines", "Distilled spirits", "Liqueurs", "Aperitif bitters"], exp: "Vermouths are classified as fortified wines, made from a base wine that is aromatized with botanicals and fortified with a neutral spirit." },
      { q: "What is the essential botanical ingredient in vermouth?", a: ["Wormwood", "Juniper", "Anise", "Gentian"], exp: "Wormwood (Artemisia absinthium) is the essential botanical in vermouth — the name 'vermouth' comes from the German word 'Wermut' meaning wormwood." },
      { q: "Who initiated the export of vermouth in 1786?", a: ["Antonio Benedetto Carpano", "Martini & Rossi", "Noilly Prat", "Cinzano"], exp: "Antonio Benedetto Carpano is credited with creating modern vermouth in Turin in 1786 and initiating its commercial export." },
      { q: "What is the sugar content of Rosso vermouth?", a: ["Up to 130 grams per liter", "Up to 50 grams per liter", "Up to 200 grams per liter", "Less than 30 grams per liter"], exp: "Rosso (sweet/red) vermouth can contain up to 130 grams of sugar per liter, giving it its characteristic sweetness." },
      { q: "What is the typical alcohol strength of vermouth?", a: ["16% - 22%", "8% - 12%", "25% - 30%", "35% - 40%"], exp: "Vermouth typically has an alcohol strength between 16% and 22% ABV, higher than regular wine due to fortification." }
    ]
  },
  {
    id: 20,
    title: "Spirits: Vodka, Gin & Rum",
    subtitle: "World Spirits Essentials",
    icon: "🧊",
    color: "#3498db",
    questions: [
      { q: "Where was vodka first produced?", a: ["Both Poland and Russia", "Only Russia", "Sweden", "Finland"], exp: "Both Poland and Russia claim to be the birthplace of vodka, and the true origin remains a subject of debate." },
      { q: "What does the word 'vodka' mean?", a: ["Water of life (little water)", "Pure spirit", "Clear drink", "White fire"], exp: "The word 'vodka' is a diminutive of the Slavic word 'voda' meaning water, translating roughly as 'little water' or 'water of life.'" },
      { q: "What is the minimum ABV for vodka in the EU?", a: ["37.5%", "40%", "35%", "42%"], exp: "In the European Union, vodka must have a minimum alcohol by volume of 37.5% to be classified as vodka." },
      { q: "What is the key botanical ingredient in gin?", a: ["Juniper berries", "Coriander seeds", "Angelica root", "Orris root"], exp: "Juniper berries are the key and legally required botanical ingredient in gin, giving it its distinctive piney flavor." },
      { q: "What must London Dry Gin be?", a: ["Made in traditional still with no artificial flavorings", "Produced exclusively in London", "Aged in oak barrels", "Made with London tap water"], exp: "London Dry Gin must be made in a traditional still with natural botanicals and no artificial flavorings or colors added after distillation." },
      { q: "What is rum made from?", a: ["Sugarcane juice", "Corn mash", "Grain neutral spirit", "Potato starch"], exp: "Rum is made from sugarcane juice or its byproducts (primarily molasses), then fermented and distilled." },
      { q: "Where did molasses-based rum originate?", a: ["Barbados", "Jamaica", "Cuba", "Puerto Rico"], exp: "Barbados is credited as the origin of molasses-based rum production, with the earliest documented rum distillation." },
      { q: "Which country is associated with 'Rhum Agricole'?", a: ["Martinique", "Jamaica", "Cuba", "Barbados"], exp: "Martinique is most associated with Rhum Agricole, which is made from fresh sugarcane juice rather than molasses and has AOC status." },
      { q: "What is the primary ingredient in tequila?", a: ["Blue agave", "Corn", "Sugarcane", "Wheat"], exp: "Tequila must be made from at least 51% Blue Weber Agave (Agave tequilana), with 100% agave tequilas being the premium category." },
      { q: "What distinguishes Cognac from other brandies?", a: ["Must be produced in the region of Cognac, France", "Must be aged for at least 10 years", "Must use Pinot Noir grapes", "Must be distilled three times"], exp: "Cognac must be produced in the delimited Cognac region of France, following strict production methods including double distillation in copper pot stills." }
    ]
  },
  {
    id: 21,
    title: "Whisky & Brandy",
    subtitle: "Aged Spirits & Their Traditions",
    icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    color: "#d35400",
    questions: [
      { q: "What is the primary grape used in Armagnac production?", a: ["Ugni blanc", "Colombard", "Folle blanche", "Baco blanc"], exp: "Ugni blanc (also known as Trebbiano) is the primary grape variety used in Armagnac production." },
      { q: "How is Armagnac typically distilled?", a: ["Single distillation", "Double distillation", "Triple distillation", "Continuous column distillation"], exp: "Armagnac is traditionally distilled just once in a continuous column still, unlike Cognac which is double distilled." },
      { q: "What is the earliest known reference to whisky production?", a: ["Father Jon Cor", "A Scottish monk in 1200", "King James IV", "Robert Burns"], exp: "The earliest documented reference to whisky is from 1494, recording malt given to Father Jon Cor to make aqua vitae." },
      { q: "What is the minimum aging requirement for UK whisky?", a: ["3 years", "2 years", "5 years", "1 year"], exp: "In the UK, whisky must be aged for a minimum of 3 years in oak casks before it can legally be called whisky." },
      { q: "What is the primary ingredient in whisky?", a: ["Cereal grains", "Grapes", "Sugarcane", "Potatoes"], exp: "Whisky is primarily made from cereal grains such as barley, corn, rye, or wheat, which are mashed, fermented, and distilled." },
      { q: "How many times is Irish whiskey typically distilled?", a: ["Three times", "Two times", "Once", "Four times"], exp: "Irish whiskey is typically triple distilled, which contributes to its characteristically smooth and light flavor profile." },
      { q: "What is a characteristic requirement of bourbon?", a: ["Must contain at least 51% corn", "Must be aged for 5 years minimum", "Must be produced in Kentucky", "Must use charred pine barrels"], exp: "Bourbon must contain at least 51% corn in its mash bill, along with other requirements like new charred oak barrels." },
      { q: "What type of whisky does Japan produce?", a: ["Both single malt and blended", "Only single malt", "Only blended", "Only grain whisky"], exp: "Japan produces both single malt and blended whiskies, inspired by Scottish traditions but with a distinctive Japanese approach." },
      { q: "What is the 'Angel's Share' in spirit aging?", a: ["Percentage of spirit lost to evaporation", "The first pour from a new barrel", "The master blender's sample", "The residue left in the cask"], exp: "The Angel's Share refers to the percentage of spirit that evaporates through the barrel during aging, typically 2-4% per year." },
      { q: "What is the purpose of blending spirits?", a: ["To create recognizable and consistent character", "To reduce production costs only", "To increase alcohol content", "To hide defects in the spirit"], exp: "Blending creates a recognizable and consistent character, combining different spirits to achieve a balanced and harmonious final product." }
    ]
  },
  {
    id: 22,
    title: "Cocktail History & Techniques",
    subtitle: "From Punch to Modern Mixology",
    icon: "📖",
    color: "#1a237e",
    questions: [
      { q: "What type of drink preceded cocktails in the 1800s?", a: ["Punch", "Beer", "Wine coolers", "Soda water"], exp: "Punch was the dominant mixed drink before cocktails emerged in the early 1800s, typically made in large bowls for communal drinking." },
      { q: "Who is considered the first celebrity mixologist?", a: ["Jerry Thomas", "Harry Craddock", "Harry Johnson", "Orsini"], exp: "Jerry Thomas is considered the first celebrity bartender/mixologist, known for his showmanship and his 1862 book 'The Bartender's Guide.'" },
      { q: "When was the Volstead Act passed?", a: ["1919", "1920", "1918", "1921"], exp: "The Volstead Act was passed in 1919, providing the enforcement mechanism for the 18th Amendment, with Prohibition starting in 1920." },
      { q: "What was a 'speakeasy'?", a: ["An illegal drinking house", "A type of cocktail", "A bartender's union meeting", "A legal wine bar"], exp: "A speakeasy was an illegal drinking establishment during Prohibition where patrons would 'speak easy' (quietly) to avoid detection." },
      { q: "Why did tiki restaurants become popular in the 1930s?", a: ["Escape to mysteries of the orient", "Cheap rum availability", "Celebrity endorsements", "Government promotion"], exp: "Tiki restaurants became popular in the 1930s as they offered an exotic escape to the mysteries of the orient and tropical paradise." },
      { q: "What does a well-prepared exotic drink need?", a: ["Perfect balance of flavors", "The most expensive ingredients", "Elaborate decoration only", "A secret recipe"], exp: "A well-prepared exotic drink requires a perfect balance of flavors, ensuring no single element overpowers the others." },
      { q: "What do contemporary bartenders prioritize?", a: ["Consistency and quality ingredients", "Speed of service above all", "Flashy techniques", "Using as many ingredients as possible"], exp: "Contemporary bartenders prioritize consistency and quality ingredients, ensuring every drink meets high standards." },
      { q: "What is the gold standard for juice in cocktails?", a: ["Fresh squeezed juice", "Pasteurized juice", "Concentrated juice", "Powdered juice mix"], exp: "Fresh squeezed juice is the gold standard in cocktails, providing the best flavor, aroma, and quality." },
      { q: "What is the first step in crafting a cocktail?", a: ["Know the intended taste, smell, and look", "Choose the glassware", "Select the garnish", "Measure the ingredients"], exp: "The first step in crafting a cocktail is knowing the intended taste, smell, and look — having a clear vision of the final product." },
      { q: "Why is clear ice preferred in cocktails?", a: ["Better cooling power", "It looks more elegant only", "It is cheaper to produce", "It has no taste difference"], exp: "Clear ice is preferred because it has better cooling power, melts more slowly, and is denser than cloudy ice." }
    ]
  },
  {
    id: 23,
    title: "Responsible Service & Bar Management",
    subtitle: "Ethics, Law & Business",
    icon: "⚖️",
    color: "#37474f",
    questions: [
      { q: "What is a consequence of over-serving alcohol?", a: ["Legal liability for the bartender", "Only a verbal warning", "Increased tips", "No consequences exist"], exp: "Over-serving alcohol can result in legal liability for the bartender and the establishment, including fines and criminal charges." },
      { q: "What is a key aspect of responsible alcohol service?", a: ["Limiting alcohol servings to intoxicated guests", "Serving as much as guests request", "Only checking ID at the door", "Offering free drinks to regulars"], exp: "Responsible service includes limiting or refusing alcohol to intoxicated guests to ensure their safety and legal compliance." },
      { q: "What is alcohol's initial effect on inhibitions?", a: ["Suppresses control", "Enhances control", "Has no effect", "Improves judgment"], exp: "Alcohol initially suppresses the brain's control centers, lowering inhibitions and impairing judgment." },
      { q: "At what BAC level is it illegal to drive in most jurisdictions?", a: [".08%", ".05%", ".10%", ".15%"], exp: "In most US jurisdictions, a blood alcohol concentration (BAC) of .08% is the legal limit for driving." },
      { q: "What is true about alcohol (ethanol)?", a: ["Ethanol can lead to dependency", "Ethanol is not addictive", "Ethanol improves long-term health", "Ethanol has no calories"], exp: "Ethanol is an addictive substance that can lead to physical and psychological dependency with prolonged excessive use." },
      { q: "What are the three main stakeholders in a bar business?", a: ["The Guests, The Business, Fellow Employees", "Owners, Suppliers, Government", "Bartenders, Managers, Investors", "Customers, Banks, Competitors"], exp: "The three main stakeholders are the Guests (who must be satisfied), the Business (which must be profitable), and Fellow Employees (who must work as a team)." },
      { q: "What percentage of dissatisfied guests actually complain?", a: ["4%", "25%", "50%", "75%"], exp: "Only about 4% of dissatisfied guests actually complain — the rest simply leave and don't return, making complaint resolution crucial." },
      { q: "What is gross profit?", a: ["Amount of sales minus variable costs", "Total revenue before any deductions", "Net income after all expenses", "Total tips collected"], exp: "Gross profit is calculated as the amount of sales minus variable costs (cost of goods sold)." },
      { q: "Why are standard drink sizes important?", a: ["To prevent over-pouring and control costs", "Only for legal compliance", "To speed up service", "For aesthetic presentation only"], exp: "Standard drink sizes are important to prevent over-pouring, control costs, maintain consistency, and ensure responsible service." },
      { q: "What does the IBA 'Unforgettables' category include?", a: ["Classic drinks that stood the test of time", "Only drinks invented after 2000", "Experimental molecular cocktails", "Non-alcoholic beverages only"], exp: "The IBA 'Unforgettables' category includes classic cocktails that have stood the test of time and remain beloved worldwide." }
    ]
  },
  {
    id: 24,
    title: "IBA Cocktail Specifics",
    subtitle: "Official IBA Recipes & Details",
    icon: "🏆",
    color: "#ff6f00",
    questions: [
      { q: "Which IBA category does the Bramble belong to?", a: ["New Era", "Unforgettables", "Contemporary Classics", "Tiki Classics"], exp: "The Bramble, created by Dick Bradsell in the 1980s, is classified as a New Era drink in the IBA official list." },
      { q: "What is the garnish for an Americano?", a: ["Orange slice or peel", "Lemon twist", "Cherry", "Olive"], exp: "The Americano is traditionally garnished with an orange slice or orange peel." },
      { q: "How is an Alexander prepared?", a: ["Shake and strain", "Build in glass", "Stir and strain", "Blend with ice"], exp: "The Alexander cocktail is prepared by shaking all ingredients with ice and straining into a cocktail glass." },
      { q: "What spirit does Between the Sheets contain?", a: ["Cognac", "Bourbon", "Scotch", "Rum only"], exp: "Between the Sheets contains Cognac along with white rum, triple sec, and lemon juice." },
      { q: "Which IBA category does Bloody Mary belong to?", a: ["Contemporary Classics", "Unforgettables", "New Era", "Tiki Classics"], exp: "The Bloody Mary is classified as a Contemporary Classic in the IBA official cocktail list." },
      { q: "What distinguishes the Brandy Crusta's garnish?", a: ["Sugar-crusted glass with long lemon peel", "A simple lemon wheel", "A cherry on a cocktail pick", "An orange twist"], exp: "The Brandy Crusta is distinguished by its sugar-crusted rim and a long spiral lemon peel lining the inside of the glass." },
      { q: "What is the main spirit in a Negroni?", a: ["Gin", "Vodka", "Campari", "Whisky"], exp: "The Negroni's main spirit is gin, combined with equal parts Campari and sweet vermouth." },
      { q: "What is the primary spirit in a Jungle Bird?", a: ["Blackstrap rum", "White rum", "Bourbon", "Tequila"], exp: "The Jungle Bird uses blackstrap rum (dark rum) as its primary spirit, combined with Campari, pineapple juice, lime juice, and simple syrup." },
      { q: "What spirit is used in a Tipperary?", a: ["Irish Whiskey", "Scotch Whisky", "Bourbon", "Rye Whiskey"], exp: "The Tipperary cocktail uses Irish Whiskey, named after the Irish county, combined with sweet vermouth and green Chartreuse." },
      { q: "What ingredient is optional in a Southside?", a: ["Egg White", "Soda water", "Bitters", "Sugar syrup"], exp: "Egg white is an optional ingredient in the Southside cocktail, adding a silky texture when included." }
    ]
  }
];
