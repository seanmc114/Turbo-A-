// Turbo: Q+ — Statements Mode with Tense Generation
// - Boots to level list (no external buttons required)
// - In-level Tense dropdown (Present/Past/Future)
// - Past/Future are auto-built from Present with tuned mappings
// - Spanish targets: accents kept; no inverted ¿ ; no "ñ" (use "n")
// - localStorage namespaced (won't collide with previous game)

(() => {
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ===================== CONFIG =====================
  const QUESTIONS_PER_ROUND = 10;
  const PENALTY_PER_WRONG   = 30;
  const BASE_THRESH = { 1:200, 2:180, 3:160, 4:140, 5:120, 6:100, 7:80, 8:60, 9:40 };

  const GAME_ID = "tqplus:statements-v1";
  const GLOBAL_CHEATS_MAX = 7;
  const GLOBAL_CHEATS_KEY = `${GAME_ID}:globalCheats`;
  const STORAGE_PREFIX    = `${GAME_ID}:best`;

  // ===================== DATA (Present statements) =====================
  // Accents kept; the letter "ñ" is replaced with "n" by design.
  const Present = {
    1: [
      { en: "You are happy.",            es: "Estas feliz." },         // (note: 'feliz' has no accent)
      { en: "You are tall.",             es: "Eres alto." },
      { en: "You are in class.",         es: "Estas en clase." },
      { en: "You are kind.",             es: "Eres amable." },
      { en: "You are tired.",            es: "Estas cansado." },
      { en: "You are ready.",            es: "Estas lista." },         // feminine
      { en: "You are calm.",             es: "Estas tranquilo." },
      { en: "You are funny.",            es: "Eres gracioso." },
      { en: "You are strong.",           es: "Eres fuerte." },
      { en: "You are beautiful.",        es: "Eres bonita." },         // feminine
    ],
    2: [
      { en: "It is a cat.",              es: "Es un gato." },
      { en: "It is a dog.",              es: "Es un perro." },
      { en: "It is a sunny day.",        es: "Es un dia soleado." },
      { en: "It is cold.",               es: "Hace frio." },
      { en: "You are at home.",          es: "Estas en casa." },
      { en: "It is blue.",               es: "Es azul." },
      { en: "It is big.",                es: "Es grande." },
      { en: "It is small.",              es: "Es pequeno." },          // pequeño → 'pequeno'
      { en: "It is interesting.",        es: "Es interesante." },
      { en: "It is beautiful.",          es: "Es bonito." },
    ],
    3: [
      { en: "You live in Madrid.",       es: "Vives en Madrid." },
      { en: "You study Spanish.",        es: "Estudias espanol." },    // español → espanol
      { en: "You play football.",        es: "Juegas al futbol." },
      { en: "You like chocolate.",       es: "Te gusta el chocolate." },
      { en: "You work hard.",            es: "Trabajas mucho." },
      { en: "You read books.",           es: "Lees libros." },
      { en: "You eat fruit.",            es: "Comes fruta." },
      { en: "You drink water.",          es: "Bebes agua." },
      { en: "You listen to music.",      es: "Escuchas musica." },
      { en: "You sing well.",            es: "Cantas bien." },
    ],
    4: [
      { en: "Carlos is your teacher.",   es: "Carlos es tu profesor." },
      { en: "Ana is at school.",         es: "Ana esta en la escuela." },
      { en: "You sleep early.",          es: "Duermes temprano." },
      { en: "You run fast.",             es: "Corres rapido." },
      { en: "You learn every day.",      es: "Aprendes cada dia." },
      { en: "You work in an office.",    es: "Trabajas en una oficina." },
      { en: "You like English.",         es: "Te gusta el ingles." },
      { en: "You walk to school.",       es: "Caminas a la escuela." },
      { en: "Maria is your friend.",     es: "Maria es tu amiga." },
      { en: "You are busy.",             es: "Estas ocupado." },
    ],
    5: [
      { en: "They are students.",        es: "Son estudiantes." },
      { en: "You are playing football.", es: "Juegas al futbol." },
      { en: "You are going to the park.",es: "Vas al parque." },
      { en: "You arrive early.",         es: "Llegas temprano." },
      { en: "You are never late.",       es: "Nunca llegas tarde." },
      { en: "You know a lot.",           es: "Sabes mucho." },
      { en: "You prefer apples.",        es: "Prefieres manzanas." },
      { en: "The idea is good.",         es: "La idea es buena." },
      { en: "You speak Spanish.",        es: "Hablas espanol." },
      { en: "We have time.",             es: "Tenemos tiempo." },
    ],
    6: [
      { en: "Luis helps you.",           es: "Luis te ayuda." },
      { en: "You need a pencil.",        es: "Necesitas un lapiz." },
      { en: "Your house is big.",        es: "Tu casa es grande." },
      { en: "You eat lunch at twelve.",  es: "Almuerzas a las doce." },
      { en: "You study Spanish.",        es: "Estudias espanol." },
      { en: "You go to school by bus.",  es: "Vas a la escuela en autobus." },
      { en: "You are in class five.",    es: "Estas en la clase cinco." },
      { en: "It is your turn.",          es: "Es tu turno." },
      { en: "You have two pets.",        es: "Tienes dos mascotas." },
      { en: "It costs ten euros.",       es: "Cuesta diez euros." },
    ],
    7: [
      { en: "You help at home.",         es: "Ayudas en casa." },
      { en: "You eat breakfast at eight.", es: "Desayunas a las ocho." },
      { en: "You go out on weekends.",   es: "Sales los fines de semana." },
      { en: "You wake up early.",        es: "Te despiertas temprano." },
      { en: "You run every morning.",    es: "Corres cada manana." },  // mañana → manana
      { en: "You feel good today.",      es: "Te sientes bien hoy." },
      { en: "You like this movie.",      es: "Te gusta esta pelicula." },
      { en: "Your phone is on the table.", es: "Tu telefono esta en la mesa." },
      { en: "You study two hours.",      es: "Estudias dos horas." },
      { en: "You have little homework.", es: "Tienes poca tarea." },
    ],
    8: [
      { en: "Someone is calling.",       es: "Alguien llama." },
      { en: "They are working.",         es: "Trabajan." },
      { en: "You go to school every day.", es: "Vas a la escuela cada dia." },
      { en: "You finish work at three.", es: "Terminas el trabajo a las tres." },
      { en: "You are tired now.",        es: "Estas cansado ahora." },
      { en: "You travel by train.",      es: "Viajas en tren." },
      { en: "You like the color blue.",  es: "Te gusta el color azul." },
      { en: "Your bag is new.",          es: "Tu bolsa es nueva." },
      { en: "Many people live here.",    es: "Mucha gente vive aqui." },
      { en: "You drink water every day.",es: "Bebes agua cada dia." },
    ],
    9: [
      { en: "You open the door.",        es: "Abres la puerta." },
      { en: "You say good morning.",     es: "Dices buenos dias." },
      { en: "You go home after class.",  es: "Vas a casa despues de clase." },
      { en: "You arrive at school early.", es: "Llegas a la escuela temprano." },
      { en: "You leave at four.",        es: "Te vas a las cuatro." },
      { en: "You do your homework.",     es: "Haces tu tarea." },
      { en: "You choose a car.",         es: "Eliges un coche." },
      { en: "Your shoes are clean.",     es: "Tus zapatos estan limpios." },
      { en: "Students pass the exam.",   es: "Los estudiantes aprueban el examen." },
      { en: "You drink milk.",           es: "Bebes leche." },
    ],
    10: [
      { en: "You wait for Ana.",         es: "Esperas a Ana." },
      { en: "You think about your friends.", es: "Piensas en tus amigos." },
      { en: "You want to travel.",       es: "Quieres viajar." },
      { en: "You return home at six.",   es: "Vuelves a casa a las seis." },
      { en: "You are here now.",         es: "Estas aqui ahora." },
      { en: "You learn a lot.",          es: "Aprendes mucho." },
      { en: "You prefer these shoes.",   es: "Prefieres estos zapatos." },
      { en: "It is your turn to cook.",  es: "Es tu turno de cocinar." },
      { en: "You read many books.",      es: "Lees muchos libros." },
      { en: "We have enough time.",      es: "Tenemos suficiente tiempo." },
    ],
  };

  // ===== English Past/Future prompts (exact matches to Present.en) =====
  const EN_PAST = new Map([
    ["You are happy.", "You were happy."],
    ["You are tall.", "You were tall."],
    ["You are in class.", "You were in class."],
    ["You are kind.", "You were kind."],
    ["You are tired.", "You were tired."],
    ["You are ready.", "You were ready."],
    ["You are calm.", "You were calm."],
    ["You are funny.", "You were funny."],
    ["You are strong.", "You were strong."],
    ["You are beautiful.", "You were beautiful."],

    ["It is a cat.", "It was a cat."],
    ["It is a dog.", "It was a dog."],
    ["It is a sunny day.", "It was a sunny day."],
    ["It is cold.", "It was cold."],
    ["You are at home.", "You were at home."],
    ["It is blue.", "It was blue."],
    ["It is big.", "It was big."],
    ["It is small.", "It was small."],
    ["It is interesting.", "It was interesting."],
    ["It is beautiful.", "It was beautiful."],

    ["You live in Madrid.", "You lived in Madrid."],
    ["You study Spanish.", "You studied Spanish."],
    ["You play football.", "You played football."],
    ["You like chocolate.", "You liked chocolate."],
    ["You work hard.", "You worked hard."],
    ["You read books.", "You read books."],
    ["You eat fruit.", "You ate fruit."],
    ["You drink water.", "You drank water."],
    ["You listen to music.", "You listened to music."],
    ["You sing well.", "You sang well."],

    ["Carlos is your teacher.", "Carlos was your teacher."],
    ["Ana is at school.", "Ana was at school."],
    ["You sleep early.", "You slept early."],
    ["You run fast.", "You ran fast."],
    ["You learn every day.", "You learned every day."],
    ["You work in an office.", "You worked in an office."],
    ["You like English.", "You liked English."],
    ["You walk to school.", "You walked to school."],
    ["Maria is your friend.", "Maria was your friend."],
    ["You are busy.", "You were busy."],

    ["They are students.", "They were students."],
    ["You are playing football.", "You played football."],
    ["You are going to the park.", "You went to the park."],
    ["You arrive early.", "You arrived early."],
    ["You are never late.", "You were never late."],
    ["You know a lot.", "You knew a lot."],
    ["You prefer apples.", "You preferred apples."],
    ["The idea is good.", "The idea was good."],
    ["You speak Spanish.", "You spoke Spanish."],
    ["We have time.", "We had time."],

    ["Luis helps you.", "Luis helped you."],
    ["You need a pencil.", "You needed a pencil."],
    ["Your house is big.", "Your house was big."],
    ["You eat lunch at twelve.", "You ate lunch at twelve."],
    ["You go to school by bus.", "You went to school by bus."],
    ["You are in class five.", "You were in class five."],
    ["It is your turn.", "It was your turn."],
    ["You have two pets.", "You had two pets."],
    ["It costs ten euros.", "It cost ten euros."],
    ["You study Spanish.", "You studied Spanish."],

    ["You help at home.", "You helped at home."],
    ["You eat breakfast at eight.", "You ate breakfast at eight."],
    ["You go out on weekends.", "You went out on weekends."],
    ["You wake up early.", "You woke up early."],
    ["You run every morning.", "You ran every morning."],
    ["You feel good today.", "You felt good today."],
    ["You like this movie.", "You liked this movie."],
    ["Your phone is on the table.", "Your phone was on the table."],
    ["You study two hours.", "You studied two hours."],
    ["You have little homework.", "You had little homework."],

    ["Someone is calling.", "Someone called."],
    ["They are working.", "They worked."],
    ["You go to school every day.", "You went to school every day."],
    ["You finish work at three.", "You finished work at three."],
    ["You are tired now.", "You were tired now."],
    ["You travel by train.", "You traveled by train."],
    ["You like the color blue.", "You liked the color blue."],
    ["Your bag is new.", "Your bag was new."],
    ["Many people live here.", "Many people lived here."],
    ["You drink water every day.", "You drank water every day."],

    ["You open the door.", "You opened the door."],
    ["You say good morning.", "You said good morning."],
    ["You go home after class.", "You went home after class."],
    ["You arrive at school early.", "You arrived at school early."],
    ["You leave at four.", "You left at four."],
    ["You do your homework.", "You did your homework."],
    ["You choose a car.", "You chose a car."],
    ["Your shoes are clean.", "Your shoes were clean."],
    ["Students pass the exam.", "Students passed the exam."],
    ["You drink milk.", "You drank milk."],

    ["You wait for Ana.", "You waited for Ana."],
    ["You think about your friends.", "You thought about your friends."],
    ["You want to travel.", "You wanted to travel."],
    ["You return home at six.", "You returned home at six."],
    ["You are here now.", "You were here now."],
    ["You learn a lot.", "You learned a lot."],
    ["You prefer these shoes.", "You preferred these shoes."],
    ["It is your turn to cook.", "It was your turn to cook."],
    ["You read many books.", "You read many books."],
    ["We have enough time.", "We had enough time."],
  ]);

  const EN_FUTURE = new Map([
    ["You are happy.", "You will be happy."],
    ["You are tall.", "You will be tall."],
    ["You are in class.", "You will be in class."],
    ["You are kind.", "You will be kind."],
    ["You are tired.", "You will be tired."],
    ["You are ready.", "You will be ready."],
    ["You are calm.", "You will be calm."],
    ["You are funny.", "You will be funny."],
    ["You are strong.", "You will be strong."],
    ["You are beautiful.", "You will be beautiful."],

    ["It is a cat.", "It will be a cat."],
    ["It is a dog.", "It will be a dog."],
    ["It is a sunny day.", "It will be a sunny day."],
    ["It is cold.", "It will be cold."],
    ["You are at home.", "You will be at home."],
    ["It is blue.", "It will be blue."],
    ["It is big.", "It will be big."],
    ["It is small.", "It will be small."],
    ["It is interesting.", "It will be interesting."],
    ["It is beautiful.", "It will be beautiful."],

    ["You live in Madrid.", "You will live in Madrid."],
    ["You study Spanish.", "You will study Spanish."],
    ["You play football.", "You will play football."],
    ["You like chocolate.", "You will like chocolate."],
    ["You work hard.", "You will work hard."],
    ["You read books.", "You will read books."],
    ["You eat fruit.", "You will eat fruit."],
    ["You drink water.", "You will drink water."],
    ["You listen to music.", "You will listen to music."],
    ["You sing well.", "You will sing well."],

    ["Carlos is your teacher.", "Carlos will be your teacher."],
    ["Ana is at school.", "Ana will be at school."],
    ["You sleep early.", "You will sleep early."],
    ["You run fast.", "You will run fast."],
    ["You learn every day.", "You will learn every day."],
    ["You work in an office.", "You will work in an office."],
    ["You like English.", "You will like English."],
    ["You walk to school.", "You will walk to school."],
    ["Maria is your friend.", "Maria will be your friend."],
    ["You are busy.", "You will be busy."],

    ["They are students.", "They will be students."],
    ["You are playing football.", "You will play football."],
    ["You are going to the park.", "You will go to the park."],
    ["You arrive early.", "You will arrive early."],
    ["You are never late.", "You will never be late."],
    ["You know a lot.", "You will know a lot."],
    ["You prefer apples.", "You will prefer apples."],
    ["The idea is good.", "The idea will be good."],
    ["You speak Spanish.", "You will speak Spanish."],
    ["We have time.", "We will have time."],

    ["Luis helps you.", "Luis will help you."],
    ["You need a pencil.", "You will need a pencil."],
    ["Your house is big.", "Your house will be big."],
    ["You eat lunch at twelve.", "You will eat lunch at twelve."],
    ["You go to school by bus.", "You will go to school by bus."],
    ["You are in class five.", "You will be in class five."],
    ["It is your turn.", "It will be your turn."],
    ["You have two pets.", "You will have two pets."],
    ["It costs ten euros.", "It will cost ten euros."],
    ["You study Spanish.", "You will study Spanish."],

    ["You help at home.", "You will help at home."],
    ["You eat breakfast at eight.", "You will eat breakfast at eight."],
    ["You go out on weekends.", "You will go out on weekends."],
    ["You wake up early.", "You will wake up early."],
    ["You run every morning.", "You will run every morning."],
    ["You feel good today.", "You will feel good today."],
    ["You like this movie.", "You will like this movie."],
    ["Your phone is on the table.", "Your phone will be on the table."],
    ["You study two hours.", "You will study two hours."],
    ["You have little homework.", "You will have little homework."],

    ["Someone is calling.", "Someone will call."],
    ["They are working.", "They will work."],
    ["You go to school every day.", "You will go to school every day."],
    ["You finish work at three.", "You will finish work at three."],
    ["You are tired now.", "You will be tired later."],
    ["You travel by train.", "You will travel by train."],
    ["You like the color blue.", "You will like the color blue."],
    ["Your bag is new.", "Your bag will be new."],
    ["Many people live here.", "Many people will live here."],
    ["You drink water every day.", "You will drink water every day."],

    ["You open the door.", "You will open the door."],
    ["You say good morning.", "You will say good morning."],
    ["You go home after class.", "You will go home after class."],
    ["You arrive at school early.", "You will arrive at school early."],
    ["You leave at four.", "You will leave at four."],
    ["You do your homework.", "You will do your homework."],
    ["You choose a car.", "You will choose a car."],
    ["Your shoes are clean.", "Your shoes will be clean."],
    ["Students pass the exam.", "Students will pass the exam."],
    ["You drink milk.", "You will drink milk."],

    ["You wait for Ana.", "You will wait for Ana."],
    ["You think about your friends.", "You will think about your friends."],
    ["You want to travel.", "You will want to travel."],
    ["You return home at six.", "You will return home at six."],
    ["You are here now.", "You will be here later."],
    ["You learn a lot.", "You will learn a lot."],
    ["You prefer these shoes.", "You will prefer these shoes."],
    ["It is your turn to cook.", "It will be your turn to cook."],
    ["You read many books.", "You will read many books."],
    ["We have enough time.", "We will have enough time."],
  ]);

  // ===== Spanish Past/Future targets (match EXACT Present.es strings) =====
  const ES_PAST = new Map([
    // L1
    ["Estas feliz.", "Estuviste feliz."],
    ["Eres alto.", "Eras alto."],
    ["Estas en clase.", "Estuviste en clase."],
    ["Eres amable.", "Eras amable."],
    ["Estas cansado.", "Estuviste cansado."],
    ["Estas lista.", "Estuviste lista."],
    ["Estas tranquilo.", "Estuviste tranquilo."],
    ["Eres gracioso.", "Eras gracioso."],
    ["Eres fuerte.", "Eras fuerte."],
    ["Eres bonita.", "Eras bonita."],

    // L2
    ["Es un gato.", "Era un gato."],
    ["Es un perro.", "Era un perro."],
    ["Es un dia soleado.", "Era un dia soleado."],
    ["Hace frio.", "Hizo frio."],
    ["Estas en casa.", "Estuviste en casa."],
    ["Es azul.", "Era azul."],
    ["Es grande.", "Era grande."],
    ["Es pequeno.", "Era pequeno."],
    ["Es interesante.", "Era interesante."],
    ["Es bonito.", "Era bonito."],

    // L3
    ["Vives en Madrid.", "Viviste en Madrid."],
    ["Estudias espanol.", "Estudiaste espanol."],
    ["Juegas al futbol.", "Jugaste al futbol."],
    ["Te gusta el chocolate.", "Te gustaba el chocolate."],
    ["Trabajas mucho.", "Trabajaste mucho."],
    ["Lees libros.", "Leiste libros."],
    ["Comes fruta.", "Comiste fruta."],
    ["Bebes agua.", "Bebiste agua."],
    ["Escuchas musica.", "Escuchaste musica."],
    ["Cantas bien.", "Cantaste bien."],

    // L4
    ["Carlos es tu profesor.", "Carlos era tu profesor."],
    ["Ana esta en la escuela.", "Ana estuvo en la escuela."],
    ["Duermes temprano.", "Dormiste temprano."],
    ["Corres rapido.", "Corriste rapido."],
    ["Aprendes cada dia.", "Aprendiste cada dia."],
    ["Trabajas en una oficina.", "Trabajaste en una oficina."],
    ["Te gusta el ingles.", "Te gustaba el ingles."],
    ["Caminas a la escuela.", "Caminaste a la escuela."],
    ["Maria es tu amiga.", "Maria era tu amiga."],
    ["Estas ocupado.", "Estuviste ocupado."],

    // L5
    ["Son estudiantes.", "Eran estudiantes."],
    ["Juegas al futbol.", "Jugaste al futbol."],
    ["Vas al parque.", "Fuiste al parque."],
    ["Llegas temprano.", "Llegaste temprano."],
    ["Nunca llegas tarde.", "Nunca llegaste tarde."],
    ["Sabes mucho.", "Sabias mucho."],
    ["Prefieres manzanas.", "Preferiste manzanas."],
    ["La idea es buena.", "La idea era buena."],
    ["Hablas espanol.", "Hablaste espanol."],
    ["Tenemos tiempo.", "Tuvimos tiempo."],

    // L6
    ["Luis te ayuda.", "Luis te ayudo."],
    ["Necesitas un lapiz.", "Necesitaste un lapiz."],
    ["Tu casa es grande.", "Tu casa era grande."],
    ["Almuerzas a las doce.", "Almorzaste a las doce."],
    ["Estudias espanol.", "Estudiaste espanol."],
    ["Vas a la escuela en autobus.", "Fuiste a la escuela en autobus."],
    ["Estas en la clase cinco.", "Estuviste en la clase cinco."],
    ["Es tu turno.", "Fue tu turno."],
    ["Tienes dos mascotas.", "Tuviste dos mascotas."],
    ["Cuesta diez euros.", "Costo diez euros."],

    // L7
    ["Ayudas en casa.", "Ayudaste en casa."],
    ["Desayunas a las ocho.", "Desayunaste a las ocho."],
    ["Sales los fines de semana.", "Salias los fines de semana."],
    ["Te despiertas temprano.", "Te despertaste temprano."],
    ["Corres cada manana.", "Corriste cada manana."],
    ["Te sientes bien hoy.", "Te sentiste bien hoy."],
    ["Te gusta esta pelicula.", "Te gusto esta pelicula."],
    ["Tu telefono esta en la mesa.", "Tu telefono estuvo en la mesa."],
    ["Estudias dos horas.", "Estudiaste dos horas."],
    ["Tienes poca tarea.", "Tuviste poca tarea."],

    // L8
    ["Alguien llama.", "Alguien llamo."],
    ["Trabajan.", "Trabajaron."],
    ["Vas a la escuela cada dia.", "Ibas a la escuela cada dia."],
    ["Terminas el trabajo a las tres.", "Terminaste el trabajo a las tres."],
    ["Estas cansado ahora.", "Estuviste cansado ahora."],
    ["Viajas en tren.", "Viajaste en tren."],
    ["Te gusta el color azul.", "Te gustaba el color azul."],
    ["Tu bolsa es nueva.", "Tu bolsa era nueva."],
    ["Mucha gente vive aqui.", "Mucha gente vivio aqui."],
    ["Bebes agua cada dia.", "Bebias agua cada dia."],

    // L9
    ["Abres la puerta.", "Abriste la puerta."],
    ["Dices buenos dias.", "Dijiste buenos dias."],
    ["Vas a casa despues de clase.", "Fuiste a casa despues de clase."],
    ["Llegas a la escuela temprano.", "Llegaste a la escuela temprano."],
    ["Te vas a las cuatro.", "Te fuiste a las cuatro."],
    ["Haces tu tarea.", "Hiciste tu tarea."],
    ["Eliges un coche.", "Elegiste un coche."],
    ["Tus zapatos estan limpios.", "Tus zapatos estuvieron limpios."],
    ["Los estudiantes aprueban el examen.", "Los estudiantes aprobaron el examen."],
    ["Bebes leche.", "Bebiste leche."],

    // L10
    ["Esperas a Ana.", "Esperaste a Ana."],
    ["Piensas en tus amigos.", "Pensaste en tus amigos."],
    ["Quieres viajar.", "Quisiste viajar."],
    ["Vuelves a casa a las seis.", "Volviste a casa a las seis."],
    ["Estas aqui ahora.", "Estuviste aqui ahora."],
    ["Aprendes mucho.", "Aprendiste mucho."],
    ["Prefieres estos zapatos.", "Preferiste estos zapatos."],
    ["Es tu turno de cocinar.", "Fue tu turno de cocinar."],
    ["Lees muchos libros.", "Leiste muchos libros."],
    ["Tenemos suficiente tiempo.", "Tuvimos suficiente tiempo."],
  ]);

  const ES_FUTURE = new Map([
    // L1
    ["Estas feliz.", "Estaras feliz."],
    ["Eres alto.", "Seras alto."],
    ["Estas en clase.", "Estaras en clase."],
    ["Eres amable.", "Seras amable."],
    ["Estas cansado.", "Estaras cansado."],
    ["Estas lista.", "Estaras lista."],
    ["Estas tranquilo.", "Estaras tranquilo."],
    ["Eres gracioso.", "Seras gracioso."],
    ["Eres fuerte.", "Seras fuerte."],
    ["Eres bonita.", "Seras bonita."],

    // L2
    ["Es un gato.", "Sera un gato."],
    ["Es un perro.", "Sera un perro."],
    ["Es un dia soleado.", "Sera un dia soleado."],
    ["Hace frio.", "Hara frio."],
    ["Estas en casa.", "Estaras en casa."],
    ["Es azul.", "Sera azul."],
    ["Es grande.", "Sera grande."],
    ["Es pequeno.", "Sera pequeno."],
    ["Es interesante.", "Sera interesante."],
    ["Es bonito.", "Sera bonito."],

    // L3
    ["Vives en Madrid.", "Viviras en Madrid."],
    ["Estudias espanol.", "Estudiaras espanol."],
    ["Juegas al futbol.", "Jugaras al futbol."],
    ["Te gusta el chocolate.", "Te gustara el chocolate."],
    ["Trabajas mucho.", "Trabajaras mucho."],
    ["Lees libros.", "Leeras libros."],
    ["Comes fruta.", "Comeras fruta."],
    ["Bebes agua.", "Beberas agua."],
    ["Escuchas musica.", "Escucharas musica."],
    ["Cantas bien.", "Cantaras bien."],

    // L4
    ["Carlos es tu profesor.", "Carlos sera tu profesor."],
    ["Ana esta en la escuela.", "Ana estara en la escuela."],
    ["Duermes temprano.", "Dormiras temprano."],
    ["Corres rapido.", "Correras rapido."],
    ["Aprendes cada dia.", "Aprenderas cada dia."],
    ["Trabajas en una oficina.", "Trabajaras en una oficina."],
    ["Te gusta el ingles.", "Te gustara el ingles."],
    ["Caminas a la escuela.", "Caminaras a la escuela."],
    ["Maria es tu amiga.", "Maria sera tu amiga."],
    ["Estas ocupado.", "Estaras ocupado."],

    // L5
    ["Son estudiantes.", "Seran estudiantes."],
    ["Juegas al futbol.", "Jugaras al futbol."],
    ["Vas al parque.", "Iras al parque."],
    ["Llegas temprano.", "Llegaras temprano."],
    ["Nunca llegas tarde.", "Nunca llegaras tarde."],
    ["Sabes mucho.", "Sabras mucho."],
    ["Prefieres manzanas.", "Preferiras manzanas."],
    ["La idea es buena.", "La idea sera buena."],
    ["Hablas espanol.", "Hablaras espanol."],
    ["Tenemos tiempo.", "Tendremos tiempo."],

    // L6
    ["Luis te ayuda.", "Luis te ayudara."],
    ["Necesitas un lapiz.", "Necesitaras un lapiz."],
    ["Tu casa es grande.", "Tu casa sera grande."],
    ["Almuerzas a las doce.", "Almorzaras a las doce."],
    ["Estudias espanol.", "Estudiaras espanol."],
    ["Vas a la escuela en autobus.", "Iras a la escuela en autobus."],
    ["Estas en la clase cinco.", "Estaras en la clase cinco."],
    ["Es tu turno.", "Sera tu turno."],
    ["Tienes dos mascotas.", "Tendras dos mascotas."],
    ["Cuesta diez euros.", "Costara diez euros."],

    // L7
    ["Ayudas en casa.", "Ayudaras en casa."],
    ["Desayunas a las ocho.", "Desayunaras a las ocho."],
    ["Sales los fines de semana.", "Saldras los fines de semana."],
    ["Te despiertas temprano.", "Te despertaras temprano."],
    ["Corres cada manana.", "Correras cada manana."],
    ["Te sientes bien hoy.", "Te sentiras bien hoy."],
    ["Te gusta esta pelicula.", "Te gustara esta pelicula."],
    ["Tu telefono esta en la mesa.", "Tu telefono estara en la mesa."],
    ["Estudias dos horas.", "Estudiaras dos horas."],
    ["Tienes poca tarea.", "Tendras poca tarea."],

    // L8
    ["Alguien llama.", "Alguien llamara."],
    ["Trabajan.", "Trabajaran."],
    ["Vas a la escuela cada dia.", "Iras a la escuela cada dia."],
    ["Terminas el trabajo a las tres.", "Terminaras el trabajo a las tres."],
    ["Estas cansado ahora.", "Estaras cansado luego."],
    ["Viajas en tren.", "Viajaras en tren."],
    ["Te gusta el color azul.", "Te gustara el color azul."],
    ["Tu bolsa es nueva.", "Tu bolsa sera nueva."],
    ["Mucha gente vive aqui.", "Mucha gente vivira aqui."],
    ["Bebes agua cada dia.", "Beberas agua cada dia."],

    // L9
    ["Abres la puerta.", "Abriras la puerta."],
    ["Dices buenos dias.", "Diras buenos dias."],
    ["Vas a casa despues de clase.", "Iras a casa despues de clase."],
    ["Llegas a la escuela temprano.", "Llegaras a la escuela temprano."],
    ["Te vas a las cuatro.", "Te iras a las cuatro."],
    ["Haces tu tarea.", "Haras tu tarea."],
    ["Eliges un coche.", "Elegiras un coche."],
    ["Tus zapatos estan limpios.", "Tus zapatos estaran limpios."],
    ["Los estudiantes aprueban el examen.", "Los estudiantes aprobaran el examen."],
    ["Bebes leche.", "Beberas leche."],

    // L10
    ["Esperas a Ana.", "Esperaras a Ana."],
    ["Piensas en tus amigos.", "Pensaras en tus amigos."],
    ["Quieres viajar.", "Querras viajar."],
    ["Vuelves a casa a las seis.", "Volveras a casa a las seis."],
    ["Estas aqui ahora.", "Estaras aqui luego."],
    ["Aprendes mucho.", "Aprenderas mucho."],
    ["Prefieres estos zapatos.", "Preferiras estos zapatos."],
    ["Es tu turno de cocinar.", "Sera tu turno de cocinar."],
    ["Lees muchos libros.", "Leeras muchos libros."],
    ["Tenemos suficiente tiempo.", "Tendremos suficiente tiempo."],
  ]);

  // ===== Build Past/Future datasets from Present using the maps =====
  function buildTenseDatasets(baseLevels){
    const Past = {};
    const Future = {};
    for (const lvl of Object.keys(baseLevels)) {
      Past[lvl] = baseLevels[lvl].map(({en, es}) => ({
        en: EN_PAST.get(en) || fallbackEn(en, "past"),
        es: ES_PAST.get(es) || fallbackEs(es, "past"),
      }));
      Future[lvl] = baseLevels[lvl].map(({en, es}) => ({
        en: EN_FUTURE.get(en) || fallbackEn(en, "future"),
        es: ES_FUTURE.get(es) || fallbackEs(es, "future"),
      }));
    }
    return { Past, Future };
  }

  // ===== Minimal fallbacks (only used if a sentence is missing from the maps) =====
  function fallbackEn(en, tense){
    if (tense === "past") {
      return en
        .replace(/^You are\b/i, "You were")
        .replace(/^It is\b/i, "It was")
        .replace(/\bare\b/g, "were")
        .replace(/\bis\b/g, "was")
        .replace(/\byou (go|do|have|say|leave|choose|read)\b/i, (m, v) => {
          const irr = { go:"went", do:"did", have:"had", say:"said", leave:"left", choose:"chose", read:"read" };
          return m.replace(v, irr[v]);
        })
        .replace(/\byou (\w+?)s\b/i, (_, v) => `You ${v}ed`);
    } else {
      return en
        .replace(/^You are\b/i, "You will be")
        .replace(/^It is\b/i, "It will be")
        .replace(/\bare\b/g, "will be")
        .replace(/\bis\b/g, "will be")
        .replace(/\bYou (\w+?)\b/, "You will $1");
    }
  }

  function fallbackEs(es, tense){
    // Basic shapes only; our maps cover the actual lines.
    if (tense === "past") {
      if (es.startsWith("Estas ")) return es.replace(/^Estas /, "Estuviste ");
      if (es.startsWith("Eres "))  return es.replace(/^Eres /, "Eras ");
      if (es.startsWith("Es "))    return es.replace(/^Es /, "Era ");
      if (es === "Hace frio.")     return "Hizo frio.";
      return es.replace(/\b(\w+?)as\b/g, "$1aste").replace(/\b(\w+?)es\b/g, "$1iste");
    } else {
      if (es.startsWith("Estas ")) return es.replace(/^Estas /, "Estaras ");
      if (es.startsWith("Eres "))  return es.replace(/^Eres /, "Seras ");
      if (es.startsWith("Es "))    return es.replace(/^Es /, "Sera ");
      if (es === "Hace frio.")     return "Hara frio.";
      return es.replace(/\b(\w+?)as\b/g, "$1aras").replace(/\b(\w+?)es\b/g, "$1eras");
    }
  }

  const { Past, Future } = buildTenseDatasets(Present);
  const DATASETS = { Present, Past, Future };

  // ===================== STATE / STORAGE =====================
  let CURRENT_TENSE = "Present";
  let quiz = [], currentLevel = null, t0=0, timerId=null, submitted=false;

  const clampCheats = n => Math.max(0, Math.min(GLOBAL_CHEATS_MAX, n|0));
  function getGlobalCheats(){
    const v = localStorage.getItem(GLOBAL_CHEATS_KEY);
    if (v == null) { localStorage.setItem(GLOBAL_CHEATS_KEY, String(GLOBAL_CHEATS_MAX)); return GLOBAL_CHEATS_MAX; }
    const n = parseInt(v,10);
    return Number.isFinite(n) ? clampCheats(n) : GLOBAL_CHEATS_MAX;
  }
  function setGlobalCheats(n){ localStorage.setItem(GLOBAL_CHEATS_KEY, String(clampCheats(n))); }
  const bestKey = (tense, lvl) => `${STORAGE_PREFIX}:${tense}:${lvl}`;
  function getBest(tense, lvl){ const v = localStorage.getItem(bestKey(tense,lvl)); const n = v==null?null:parseInt(v,10); return Number.isFinite(n)?n:null; }
  function saveBest(tense, lvl, score){ const prev = getBest(tense,lvl); if (prev==null || score<prev) localStorage.setItem(bestKey(tense,lvl), String(score)); }
  function isUnlocked(tense, lvl){ if (lvl===1) return true; const need = BASE_THRESH[lvl-1]; const prev = getBest(tense,lvl-1); return prev!=null && (need==null || prev<=need); }

  // ===================== Compare (STATEMENTS MODE) =====================
  const norm = s => (s||"").trim();
  function core(s){
    let t = norm(s);
    if (t.startsWith("¿")) t = t.slice(1);
    if (t.endsWith("?"))  t = t.slice(0,-1);
    // Strip accents; map 'ñ'→'n' for comparison, so kids can type without them
    t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    t = t.replace(/ñ/gi, "n");
    return t.replace(/\s+/g," ").toLowerCase();
  }
  function cmpAnswer(user, expected){ return core(user) === core(expected); }

  // ===================== Speech helpers =====================
  function speak(text, lang="es-ES"){ try{ if(!("speechSynthesis" in window)) return; const u=new SpeechSynthesisUtterance(text); u.lang=lang; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);}catch{} }
  let rec=null, recActive=false;
  function ensureRecognizer(){ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return null; if(!rec){ rec=new SR(); rec.lang="es-ES"; rec.interimResults=false; rec.maxAlternatives=1; } return rec; }
  function startDictationFor(input,onStatus){
    const r=ensureRecognizer(); if(!r){onStatus&&onStatus(false);return;}
    if(recActive){try{r.stop();}catch{} recActive=false; onStatus&&onStatus(false);}
    try{
      r.onresult=e=>{
        const txt=(e.results[0]&&e.results[0][0]&&e.results[0][0].transcript)||"";
        const v=txt.trim();
        input.value = v;
        input.dispatchEvent(new Event("input",{bubbles:true}));
      };
      r.onend=()=>{recActive=false; onStatus&&onStatus(false);};
      recActive=true; onStatus&&onStatus(true); r.start();
    }catch{ onStatus&&onStatus(false); }
  }
  function miniBtn(text,title){ const b=document.createElement("button"); b.type="button"; b.textContent=text; b.title=title; b.setAttribute("aria-label",title);
    Object.assign(b.style,{fontSize:"0.85rem",lineHeight:"1",padding:"4px 8px",marginLeft:"6px",border:"1px solid #ddd",borderRadius:"8px",background:"#fff",cursor:"pointer",verticalAlign:"middle"}); return b; }

  // ===================== Celebration Styles & Helpers =====================
  function injectCelebrationCSS(){
    if (document.getElementById("tqplus-anim-style")) return;
    const css = `
    @keyframes tq-burst { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(100vh) rotate(720deg); opacity:0} }
    @keyframes tq-pop { 0%{transform:scale(0.6); opacity:0} 25%{transform:scale(1.05); opacity:1} 60%{transform:scale(1)} 100%{opacity:0} }
    @keyframes tq-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    .tq-celebrate-overlay{ position:fixed; inset:0; z-index:9999; pointer-events:none; }
    .tq-confetti{ position:absolute; width:8px; height:14px; border-radius:2px; opacity:0.95; will-change:transform,opacity; animation:tq-burst 1600ms ease-out forwards; }
    .tq-perfect-banner{ position:fixed; left:50%; top:16%; transform:translateX(-50%); padding:10px 18px; border-radius:12px; font-weight:900; font-size:28px; letter-spacing:1px;
      color:#fff; background:linear-gradient(90deg,#ff2d55,#ff9f0a); box-shadow:0 10px 30px rgba(0,0,0,0.25); animation:tq-pop 1800ms ease-out forwards; text-shadow:0 1px 2px rgba(0,0,0,0.35); }
    .tq-shake{ animation:tq-shake 650ms ease-in-out; }
    `;
    const s=document.createElement("style"); s.id="tqplus-anim-style"; s.textContent=css; document.head.appendChild(s);
  }
  function showPerfectCelebration(){
    injectCelebrationCSS();
    const overlay = document.createElement("div");
    overlay.className = "tq-celebrate-overlay";
    document.body.appendChild(overlay);
    const COLORS = ["#ff2d55","#ff9f0a","#ffd60a","#34c759","#0a84ff","#bf5af2","#ff375f"];
    const W = window.innerWidth;
    for (let i=0; i<120; i++){
      const c = document.createElement("div");
      c.className = "tq-confetti";
      const size = 6 + Math.random()*8;
      c.style.width  = `${size}px`;
      c.style.height = `${size*1.4}px`;
      c.style.left   = `${Math.random()*W}px`;
      c.style.top    = `${-20 - Math.random()*120}px`;
      c.style.background = COLORS[i % COLORS.length];
      c.style.animationDelay = `${Math.random()*200}ms`;
      c.style.transform = `rotate(${Math.random()*360}deg)`;
      overlay.appendChild(c);
    }
    const banner = document.createElement("div");
    banner.className = "tq-perfect-banner";
    banner.textContent = "PERFECT!";
    document.body.appendChild(banner);
    setTimeout(()=>{ overlay.remove(); banner.remove(); }, 2200);
  }

  // ===================== UI flow =====================
  let cheatsUsedThisRound = 0;
  let globalSnapshotAtStart = 0;
  const attemptRemaining = () => Math.max(0, globalSnapshotAtStart - cheatsUsedThisRound);

  function updateESButtonsState(container){
    const left = attemptRemaining();
    const esBtns = Array.from(container.querySelectorAll('button[data-role="es-tts"]'));
    esBtns.forEach(btn=>{
      const active = left>0;
      btn.disabled = !active;
      btn.style.opacity = active ? "1" : "0.5";
      btn.style.cursor  = active ? "pointer" : "not-allowed";
      btn.title = active ? `Read Spanish target (uses 1; attempt left: ${left})` : "No Spanish reads left for this attempt";
    });
  }

  function startTimer(){
    t0 = Date.now();
    clearInterval(timerId);
    timerId = setInterval(()=>{ const t=Math.floor((Date.now()-t0)/1000); const el=$("#timer"); if(el) el.textContent=`Time: ${t}s`; },200);
  }
  function stopTimer(){ clearInterval(timerId); timerId=null; return Math.floor((Date.now()-t0)/1000); }

  function renderLevels(){
    const host = $("#level-list"); if(!host) return;
    host.innerHTML = "";

    // Inline tense dropdown (works regardless of any external buttons)
    let bar = $("#inline-tense-switch");
    if (!bar){
      bar = document.createElement("div");
      bar.id = "inline-tense-switch";
      bar.style.cssText = "display:flex;align-items:center;gap:8px;margin:10px 0 14px 0;";
      bar.innerHTML = `
        <label for="inline-tense-select" style="font-weight:600;">Tense:</label>
        <select id="inline-tense-select" style="padding:6px 8px;border:1px solid #ddd;border-radius:8px;">
          <option value="Present">Present</option>
          <option value="Past">Past</option>
          <option value="Future">Future</option>
        </select>
      `;
      host.appendChild(bar);
      bar.querySelector("#inline-tense-select").addEventListener("change", (e)=>{
        const t = e.target.value;
        if (DATASETS[t]) { CURRENT_TENSE = t; renderLevels(); }
      });
    }
    const sel = bar.querySelector("#inline-tense-select");
    if (sel && sel.value !== CURRENT_TENSE) sel.value = CURRENT_TENSE;

    // Level buttons
    const ds = DATASETS[CURRENT_TENSE] || {};
    const list = document.createElement("div");
    const available = Object.keys(ds).map(n=>parseInt(n,10)).filter(Number.isFinite).sort((a,b)=>a-b);
    available.forEach(i=>{
      const unlocked = isUnlocked(CURRENT_TENSE,i);
      const best = getBest(CURRENT_TENSE,i);
      const btn = document.createElement("button");
      btn.className="level-btn";
      btn.disabled=!unlocked;
      btn.style.margin="6px";
      btn.textContent = unlocked?`Level ${i}`:`🔒 Level ${i}`;
      if (unlocked && best!=null){
        const span=document.createElement("span"); span.className="best"; span.textContent=` (Best: ${best}s)`; btn.appendChild(span);
      }
      if (unlocked) btn.onclick=()=>startLevel(i);
      list.appendChild(btn);
    });
    host.appendChild(list);

    const gm=$("#game"); if(gm) gm.style.display="none";
  }

  function startLevel(level){
    currentLevel = level; submitted=false; cheatsUsedThisRound=0; globalSnapshotAtStart=getGlobalCheats();
    const lv=$("#level-list"); if(lv) lv.innerHTML="";
    const res=$("#results"); if(res) res.innerHTML="";
    const gm=$("#game"); if(gm) gm.style.display="block";

    const pool=(DATASETS[CURRENT_TENSE]?.[level])||[];
    const sample=Math.min(QUESTIONS_PER_ROUND,pool.length);
    quiz = shuffle(pool).slice(0,sample).map(it=>({prompt:it.en, answer:it.es, user:""}));

    renderQuiz(); startTimer();
  }

  function renderQuiz(){
    const qwrap=$("#questions"); if(!qwrap) return; qwrap.innerHTML="";
    quiz.forEach((q,i)=>{
      const row=document.createElement("div"); row.className="q";

      const p=document.createElement("div"); p.className="prompt"; p.textContent=`${i+1}. ${q.prompt}`;
      const controls=document.createElement("span");
      Object.assign(controls.style,{display:"inline-block",marginLeft:"6px",verticalAlign:"middle"});

      const enBtn=miniBtn("🔈 EN","Read English prompt"); enBtn.onclick=()=>speak(q.prompt,"en-GB");
      const esBtn=miniBtn("🔊 ES","Read Spanish target (uses 1 this attempt)"); esBtn.setAttribute("data-role","es-tts");
      esBtn.onclick=()=>{ if (attemptRemaining()<=0){ updateESButtonsState(qwrap); return; } speak(q.answer,"es-ES"); cheatsUsedThisRound+=1; updateESButtonsState(qwrap); };
      const micBtn=miniBtn("🎤","Dictate into this answer"); micBtn.onclick=()=>{ startDictationFor(input,(on)=>{ micBtn.style.borderColor=on?"#f39c12":"#ddd"; micBtn.style.boxShadow=on?"0 0 0 2px rgba(243,156,18,0.25)":"none"; }); };

      controls.appendChild(enBtn); controls.appendChild(esBtn); controls.appendChild(micBtn); p.appendChild(controls);

      const input=document.createElement("input"); input.type="text"; input.placeholder="Type the Spanish here";
      input.oninput=e=>{ quiz[i].user=e.target.value; };
      input.addEventListener("keydown",(e)=>{ if(e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey){ if(e.code==="KeyR"){e.preventDefault();enBtn.click();} else if(e.code==="KeyS"){e.preventDefault();esBtn.click();} else if(e.code==="KeyM"){e.preventDefault();micBtn.click();} }});

      row.appendChild(p); row.appendChild(input); qwrap.appendChild(row);
    });
    updateESButtonsState(qwrap);

    const submit=$("#submit"); if(submit){ submit.disabled=false; submit.textContent="Finish & Check"; submit.onclick=finishAndCheck; }
    const back=$("#back-button"); if(back){ back.style.display="inline-block"; back.onclick=()=>{ stopTimer(); const gm=$("#game"); if(gm) gm.style.display="none"; renderLevels(); }; }
  }

  function finishAndCheck(){
    if (submitted) return; submitted=true;

    const elapsed=stopTimer();
    const inputs=$$("#questions input"); inputs.forEach((inp,i)=>{ quiz[i].user=inp.value; });

    let correct=0, wrong=0;
    quiz.forEach((q,i)=>{ const ok=cmpAnswer(q.user,q.answer); if(ok) correct++; else wrong++; inputs[i].classList.remove("good","bad"); inputs[i].classList.add(ok?"good":"bad"); inputs[i].readOnly=true; inputs[i].disabled=true; });

    const penalties = wrong*PENALTY_PER_WRONG;
    const finalScore = elapsed + penalties;

    const submit=$("#submit"); if(submit){ submit.disabled=true; submit.textContent="Checked"; }

    let unlockMsg="";
    if (currentLevel<10){
      const need=BASE_THRESH[currentLevel];
      if (typeof need==="number"){
        if (finalScore<=need) unlockMsg=`🎉 Next level unlocked! (Needed ≤ ${need}s)`;
        else unlockMsg=`🔓 Need ${finalScore-need}s less to unlock Level ${currentLevel+1} (Target ≤ ${need}s).`;
      }
    } else unlockMsg="🏁 Final level — great work!";

    const before = getGlobalCheats();
    let after = clampCheats(globalSnapshotAtStart - cheatsUsedThisRound);
    const perfect = (correct===quiz.length);
    if (perfect && after<GLOBAL_CHEATS_MAX) after = clampCheats(after+1);
    setGlobalCheats(after);

    const results=$("#results"); if(!results) return;
    const summary=document.createElement("div"); summary.className="result-summary";
    summary.innerHTML =
      `<div class="line" style="font-size:1.35rem; font-weight:800;">🏁 FINAL SCORE: ${finalScore}s</div>
       <div class="line">⏱️ Time: <strong>${elapsed}s</strong></div>
       <div class="line">➕ Penalties: <strong>${wrong} × ${PENALTY_PER_WRONG}s = ${penalties}s</strong></div>
       <div class="line">✅ Correct: <strong>${correct}/${quiz.length}</strong></div>
       <div class="line" style="margin-top:8px;"><strong>${unlockMsg}</strong></div>
       <div class="line" style="margin-top:8px;">🎧 Spanish reads used this round: <strong>${cheatsUsedThisRound}</strong> &nbsp;|&nbsp; Global after commit: <strong>${after}/${GLOBAL_CHEATS_MAX}</strong></div>`;

    if (perfect){
      showPerfectCelebration();
      summary.classList.add("tq-shake");
      const bonusNote = document.createElement("div");
      bonusNote.className = "line";
      bonusNote.style.marginTop = "6px";
      bonusNote.innerHTML = (after>before)
        ? `⭐ Perfect round! Spanish-read tokens: ${before} → ${after} (max ${GLOBAL_CHEATS_MAX}).`
        : `⭐ Perfect round! (Spanish-read tokens already at max ${GLOBAL_CHEATS_MAX}).`;
      summary.appendChild(bonusNote);
    }

    const ul=document.createElement("ul");
    quiz.forEach(q=>{
      const li=document.createElement("li"); const ok=cmpAnswer(q.user,q.answer);
      li.className=ok?"correct":"incorrect";
      li.innerHTML = `${q.prompt} — <strong>${q.answer}</strong>` + (ok?"":` &nbsp;❌&nbsp;(you: “${q.user||""}”)`);
      ul.appendChild(li);
    });

    const again=document.createElement("button");
    again.className="try-again"; again.textContent="Try Again"; again.onclick=()=>startLevel(currentLevel);

    results.innerHTML=""; results.appendChild(summary); results.appendChild(ul); results.appendChild(again);

    saveBest(CURRENT_TENSE,currentLevel,finalScore);
    summary.scrollIntoView({behavior:"smooth",block:"start"});
  }

  // ===================== Init: boot straight to level list =====================
  document.addEventListener("DOMContentLoaded", ()=>{
    setGlobalCheats(getGlobalCheats());
    const gm=$("#game"); if (gm) gm.style.display="none";
    renderLevels(); // level list + tense dropdown (Present by default)
  });

  // ===================== Small utilities =====================
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]];} return a; }
})();
