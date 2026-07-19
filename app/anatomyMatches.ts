export type MeshMatch = {
  muscleId: string;
  partId?: string;
  name: string;
  english: string;
};

type MeshMatchRule = MeshMatch & { aliases: string[] };

// Keep specific muscles and muscle heads before their broader parent groups.
// The renderer compares both spaced and compact forms, so names such as
// `BicepsBrachiiLongHead_L` and `biceps_brachii_long_head.left` resolve alike.
export const MESH_MATCH_RULES: MeshMatchRule[] = [
  { muscleId: "neck", partId: "masseter", name: "咬肌", english: "Masseter", aliases: ["masseter"] },
  { muscleId: "neck", partId: "temporalis", name: "颞肌", english: "Temporalis", aliases: ["temporalis", "temporal muscle"] },
  { muscleId: "neck", partId: "platysma", name: "颈阔肌", english: "Platysma", aliases: ["platysma"] },
  { muscleId: "neck", partId: "sternocleidomastoid", name: "胸锁乳突肌", english: "Sternocleidomastoid", aliases: ["sternocleidomastoid", "sternocleidomastoideus", "scm"] },
  { muscleId: "neck", partId: "scalenes", name: "斜角肌群", english: "Scalenes", aliases: ["scalenus anterior", "scalenus medius", "scalenus posterior", "scalene"] },
  { muscleId: "neck", partId: "splenius", name: "夹肌群", english: "Splenius", aliases: ["splenius capitis", "splenius cervicis", "splenius"] },

  { muscleId: "deltoid", partId: "anterior-deltoid", name: "三角肌前束", english: "Anterior deltoid", aliases: ["anterior deltoid", "deltoid anterior", "deltoid clavicular"] },
  { muscleId: "deltoid", partId: "middle-deltoid", name: "三角肌中束", english: "Middle deltoid", aliases: ["middle deltoid", "lateral deltoid", "deltoid middle", "deltoid lateral", "deltoid acromial"] },
  { muscleId: "deltoid", partId: "posterior-deltoid", name: "三角肌后束", english: "Posterior deltoid", aliases: ["posterior deltoid", "rear deltoid", "deltoid posterior", "deltoid spinal"] },

  { muscleId: "chest", partId: "clavicular-pec", name: "胸大肌锁骨部", english: "Clavicular head of pectoralis major", aliases: ["pectoralis major clavicular", "clavicular pectoralis"] },
  { muscleId: "chest", partId: "sternocostal-pec", name: "胸大肌胸肋部", english: "Sternocostal head of pectoralis major", aliases: ["pectoralis major sternocostal", "sternocostal pectoralis"] },
  { muscleId: "chest", partId: "abdominal-pec", name: "胸大肌腹部", english: "Abdominal head of pectoralis major", aliases: ["pectoralis major abdominal", "abdominal pectoralis"] },
  { muscleId: "chest", partId: "pectoralis-minor", name: "胸小肌", english: "Pectoralis minor", aliases: ["pectoralis minor"] },
  { muscleId: "chest", partId: "subclavius", name: "锁骨下肌", english: "Subclavius", aliases: ["subclavius"] },
  { muscleId: "chest", partId: "intercostals", name: "肋间肌", english: "Intercostal muscles", aliases: ["external intercostal", "internal intercostal", "innermost intercostal", "intercostal"] },

  { muscleId: "biceps", partId: "biceps-long-head", name: "肱二头肌长头", english: "Long head of biceps brachii", aliases: ["biceps brachii long head", "long head biceps"] },
  { muscleId: "biceps", partId: "biceps-short-head", name: "肱二头肌短头", english: "Short head of biceps brachii", aliases: ["biceps brachii short head", "short head biceps"] },
  { muscleId: "biceps", partId: "brachialis", name: "肱肌", english: "Brachialis", aliases: ["brachialis"] },
  { muscleId: "biceps", partId: "coracobrachialis", name: "喙肱肌", english: "Coracobrachialis", aliases: ["coracobrachialis"] },

  { muscleId: "forearm", partId: "brachioradialis", name: "肱桡肌", english: "Brachioradialis", aliases: ["brachioradialis"] },
  { muscleId: "forearm", partId: "wrist-flexors", name: "腕与指屈肌群", english: "Wrist and finger flexors", aliases: ["flexor carpi radialis", "flexor carpi ulnaris", "flexor digitorum superficialis", "flexor digitorum profundus", "flexor pollicis longus", "palmaris longus"] },
  { muscleId: "forearm", partId: "wrist-extensors", name: "腕与指伸肌群", english: "Wrist and finger extensors", aliases: ["extensor carpi radialis", "extensor carpi ulnaris", "extensor digitorum", "extensor indicis", "extensor digiti minimi", "extensor pollicis"] },
  { muscleId: "forearm", partId: "pronators", name: "旋前肌群", english: "Forearm pronators", aliases: ["pronator teres", "pronator quadratus", "pronator"] },
  { muscleId: "forearm", partId: "supinators", name: "旋后肌", english: "Supinator", aliases: ["supinator"] },
  { muscleId: "forearm", partId: "hand-intrinsics", name: "手内在肌", english: "Intrinsic hand muscles", aliases: ["thenar", "hypothenar", "palmar interosse", "dorsal interosse", "lumbrical hand", "opponens pollicis", "adductor pollicis", "abductor pollicis brevis"] },

  { muscleId: "abs", name: "腹直肌", english: "Rectus abdominis", aliases: ["rectus abdominis"] },
  { muscleId: "obliques", partId: "external-oblique", name: "腹外斜肌", english: "External oblique", aliases: ["external oblique", "obliquus externus"] },
  { muscleId: "obliques", partId: "internal-oblique", name: "腹内斜肌", english: "Internal oblique", aliases: ["internal oblique", "obliquus internus"] },
  { muscleId: "obliques", partId: "transversus-abdominis", name: "腹横肌", english: "Transversus abdominis", aliases: ["transversus abdominis", "transverse abdominal"] },
  { muscleId: "serratus-anterior", name: "前锯肌", english: "Serratus anterior", aliases: ["serratus anterior", "serratus ventralis"] },

  { muscleId: "hip-flexors", partId: "psoas-major", name: "腰大肌", english: "Psoas major", aliases: ["psoas major", "psoas"] },
  { muscleId: "hip-flexors", partId: "iliacus", name: "髂肌", english: "Iliacus", aliases: ["iliacus"] },
  { muscleId: "hip-flexors", partId: "sartorius", name: "缝匠肌", english: "Sartorius", aliases: ["sartorius"] },
  { muscleId: "hip-flexors", partId: "tensor-fasciae-latae", name: "阔筋膜张肌", english: "Tensor fasciae latae", aliases: ["tensor fasciae latae", "tensor fascia lata", "tfl"] },

  { muscleId: "adductors", partId: "adductor-magnus", name: "大收肌", english: "Adductor magnus", aliases: ["adductor magnus"] },
  { muscleId: "adductors", partId: "adductor-longus", name: "长收肌", english: "Adductor longus", aliases: ["adductor longus"] },
  { muscleId: "adductors", partId: "adductor-brevis", name: "短收肌", english: "Adductor brevis", aliases: ["adductor brevis"] },
  { muscleId: "adductors", partId: "gracilis", name: "股薄肌", english: "Gracilis", aliases: ["gracilis"] },
  { muscleId: "adductors", partId: "pectineus", name: "耻骨肌", english: "Pectineus", aliases: ["pectineus"] },

  { muscleId: "quadriceps", partId: "rectus-femoris", name: "股直肌", english: "Rectus femoris", aliases: ["rectus femoris"] },
  { muscleId: "quadriceps", partId: "vastus-lateralis", name: "股外侧肌", english: "Vastus lateralis", aliases: ["vastus lateralis"] },
  { muscleId: "quadriceps", partId: "vastus-medialis", name: "股内侧肌", english: "Vastus medialis", aliases: ["vastus medialis"] },
  { muscleId: "quadriceps", partId: "vastus-intermedius", name: "股中间肌", english: "Vastus intermedius", aliases: ["vastus intermedius"] },

  { muscleId: "tibialis", partId: "tibialis-anterior", name: "胫骨前肌", english: "Tibialis anterior", aliases: ["tibialis anterior"] },
  { muscleId: "tibialis", partId: "extensor-digitorum-longus", name: "趾长伸肌", english: "Extensor digitorum longus", aliases: ["extensor digitorum longus"] },
  { muscleId: "tibialis", partId: "extensor-hallucis-longus", name: "𧿹长伸肌", english: "Extensor hallucis longus", aliases: ["extensor hallucis longus"] },
  { muscleId: "tibialis", partId: "fibularis", name: "腓骨肌群", english: "Fibularis muscles", aliases: ["fibularis longus", "fibularis brevis", "fibularis tertius", "peroneus longus", "peroneus brevis", "peroneus tertius", "fibularis", "peroneus"] },

  { muscleId: "trapezius", partId: "upper-trap", name: "斜方肌上束", english: "Upper trapezius", aliases: ["trapezius upper", "upper trapezius", "descending trapezius"] },
  { muscleId: "trapezius", partId: "middle-trap", name: "斜方肌中束", english: "Middle trapezius", aliases: ["trapezius middle", "middle trapezius", "transverse trapezius"] },
  { muscleId: "trapezius", partId: "lower-trap", name: "斜方肌下束", english: "Lower trapezius", aliases: ["trapezius lower", "lower trapezius", "ascending trapezius"] },
  { muscleId: "trapezius", partId: "levator-scapulae", name: "肩胛提肌", english: "Levator scapulae", aliases: ["levator scapulae"] },

  { muscleId: "rotator-cuff", partId: "supraspinatus", name: "冈上肌", english: "Supraspinatus", aliases: ["supraspinatus"] },
  { muscleId: "infraspinatus", name: "冈下肌", english: "Infraspinatus", aliases: ["infraspinatus"] },
  { muscleId: "rotator-cuff", partId: "teres-minor", name: "小圆肌", english: "Teres minor", aliases: ["teres minor"] },
  { muscleId: "rotator-cuff", partId: "subscapularis", name: "肩胛下肌", english: "Subscapularis", aliases: ["subscapularis"] },
  { muscleId: "teres-major", name: "大圆肌", english: "Teres major", aliases: ["teres major"] },
  { muscleId: "rhomboids", partId: "rhomboid-minor", name: "小菱形肌", english: "Rhomboid minor", aliases: ["rhomboid minor", "rhomboideus minor"] },
  { muscleId: "rhomboids", partId: "rhomboid-major", name: "大菱形肌", english: "Rhomboid major", aliases: ["rhomboid major", "rhomboideus major"] },

  { muscleId: "triceps", partId: "triceps-long-head", name: "肱三头肌长头", english: "Long head of triceps brachii", aliases: ["triceps brachii long head", "long head triceps"] },
  { muscleId: "triceps", partId: "triceps-lateral-head", name: "肱三头肌外侧头", english: "Lateral head of triceps brachii", aliases: ["triceps brachii lateral head", "lateral head triceps"] },
  { muscleId: "triceps", partId: "triceps-medial-head", name: "肱三头肌内侧头", english: "Medial head of triceps brachii", aliases: ["triceps brachii medial head", "medial head triceps"] },
  { muscleId: "lats", name: "背阔肌", english: "Latissimus dorsi", aliases: ["latissimus dorsi"] },

  { muscleId: "erectors", partId: "iliocostalis", name: "髂肋肌", english: "Iliocostalis", aliases: ["iliocostalis"] },
  { muscleId: "erectors", partId: "longissimus", name: "最长肌", english: "Longissimus", aliases: ["longissimus"] },
  { muscleId: "erectors", partId: "spinalis", name: "棘肌", english: "Spinalis", aliases: ["spinalis"] },
  { muscleId: "erectors", partId: "multifidus", name: "多裂肌", english: "Multifidus", aliases: ["multifidus"] },
  { muscleId: "erectors", partId: "quadratus-lumborum", name: "腰方肌", english: "Quadratus lumborum", aliases: ["quadratus lumborum"] },

  { muscleId: "glutes", partId: "glute-max", name: "臀大肌", english: "Gluteus maximus", aliases: ["gluteus maximus"] },
  { muscleId: "glutes", partId: "glute-medius", name: "臀中肌", english: "Gluteus medius", aliases: ["gluteus medius"] },
  { muscleId: "glutes", partId: "glute-min", name: "臀小肌", english: "Gluteus minimus", aliases: ["gluteus minimus"] },
  { muscleId: "deep-hip", partId: "piriformis", name: "梨状肌", english: "Piriformis", aliases: ["piriformis"] },
  { muscleId: "deep-hip", partId: "obturator-internus", name: "闭孔内肌", english: "Obturator internus", aliases: ["obturator internus"] },
  { muscleId: "deep-hip", partId: "obturator-externus", name: "闭孔外肌", english: "Obturator externus", aliases: ["obturator externus"] },
  { muscleId: "deep-hip", partId: "gemelli", name: "上、下孖肌", english: "Gemelli", aliases: ["gemellus superior", "gemellus inferior", "gemelli"] },
  { muscleId: "deep-hip", partId: "quadratus-femoris", name: "股方肌", english: "Quadratus femoris", aliases: ["quadratus femoris"] },

  { muscleId: "hamstrings", partId: "biceps-femoris-long", name: "股二头肌长头", english: "Long head of biceps femoris", aliases: ["biceps femoris long head", "long head biceps femoris"] },
  { muscleId: "hamstrings", partId: "biceps-femoris-short", name: "股二头肌短头", english: "Short head of biceps femoris", aliases: ["biceps femoris short head", "short head biceps femoris"] },
  { muscleId: "hamstrings", partId: "semitendinosus", name: "半腱肌", english: "Semitendinosus", aliases: ["semitendinosus"] },
  { muscleId: "hamstrings", partId: "semimembranosus", name: "半膜肌", english: "Semimembranosus", aliases: ["semimembranosus"] },

  { muscleId: "calves", partId: "medial-gastrocnemius", name: "腓肠肌内侧头", english: "Medial gastrocnemius", aliases: ["gastrocnemius medial", "medial gastrocnemius"] },
  { muscleId: "calves", partId: "lateral-gastrocnemius", name: "腓肠肌外侧头", english: "Lateral gastrocnemius", aliases: ["gastrocnemius lateral", "lateral gastrocnemius"] },
  { muscleId: "calves", partId: "soleus", name: "比目鱼肌", english: "Soleus", aliases: ["soleus"] },
  { muscleId: "calves", partId: "plantaris", name: "跖肌", english: "Plantaris", aliases: ["plantaris"] },
  { muscleId: "calves", partId: "tibialis-posterior", name: "胫骨后肌", english: "Tibialis posterior", aliases: ["tibialis posterior"] },
  { muscleId: "calves", partId: "flexor-digitorum-longus", name: "趾长屈肌", english: "Flexor digitorum longus", aliases: ["flexor digitorum longus"] },
  { muscleId: "calves", partId: "flexor-hallucis-longus", name: "𧿹长屈肌", english: "Flexor hallucis longus", aliases: ["flexor hallucis longus"] },
  { muscleId: "calves", partId: "popliteus", name: "腘肌", english: "Popliteus", aliases: ["popliteus"] },
  { muscleId: "calves", partId: "foot-intrinsics", name: "足内在肌", english: "Intrinsic foot muscles", aliases: ["abductor hallucis", "flexor digitorum brevis", "abductor digiti minimi foot", "plantar interosse", "dorsal interosse foot", "lumbrical foot", "quadratus plantae"] },

  // Broader rules are intentionally last.
  { muscleId: "deltoid", name: "三角肌", english: "Deltoid", aliases: ["deltoid", "deltoideus"] },
  { muscleId: "chest", name: "胸大肌", english: "Pectoralis major", aliases: ["pectoralis major", "pectoralis"] },
  { muscleId: "biceps", name: "肱二头肌", english: "Biceps brachii", aliases: ["biceps brachii"] },
  { muscleId: "forearm", name: "前臂肌群", english: "Forearm muscles", aliases: ["flexor carpi", "extensor carpi", "flexor digitorum", "extensor digitorum", "pronator", "supinator"] },
  { muscleId: "adductors", name: "大腿内收肌群", english: "Hip adductors", aliases: ["adductor"] },
  { muscleId: "quadriceps", name: "股四头肌", english: "Quadriceps femoris", aliases: ["quadriceps femoris", "quadriceps"] },
  { muscleId: "trapezius", name: "斜方肌", english: "Trapezius", aliases: ["trapezius"] },
  { muscleId: "rotator-cuff", name: "肩袖肌群", english: "Rotator cuff", aliases: ["rotator cuff"] },
  { muscleId: "rhomboids", name: "菱形肌", english: "Rhomboids", aliases: ["rhomboid", "rhomboideus"] },
  { muscleId: "triceps", name: "肱三头肌", english: "Triceps brachii", aliases: ["triceps brachii"] },
  { muscleId: "erectors", name: "竖脊肌与深层背肌", english: "Erector spinae", aliases: ["erector spinae"] },
  { muscleId: "glutes", name: "臀肌群", english: "Gluteal muscles", aliases: ["gluteus", "gluteal"] },
  { muscleId: "hamstrings", name: "腘绳肌", english: "Hamstrings", aliases: ["biceps femoris", "hamstring"] },
  { muscleId: "calves", name: "小腿后侧肌群", english: "Posterior lower leg", aliases: ["gastrocnemius", "triceps surae"] },
];

function normalizeAnatomyName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[_./()\[\]-]+/g, " ")
    .replace(/\b(mesh|object|geometry|musculus|muscle|left|right|sinister|sinistra|dexter|dextra|sin|dex|l|r|m)\b/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value: string) {
  return normalizeAnatomyName(value).replace(/[^a-z0-9]+/g, "");
}

export function findMeshMatch(meshName: string, validIds: Set<string>) {
  const normalized = normalizeAnatomyName(meshName);
  const compactName = compact(meshName);
  return MESH_MATCH_RULES.find((rule) =>
    validIds.has(rule.muscleId) && rule.aliases.some((alias) => {
      const normalizedAlias = normalizeAnatomyName(alias);
      const compactAlias = compact(alias);
      return normalized.includes(normalizedAlias) || (compactAlias.length > 3 && compactName.includes(compactAlias));
    }),
  );
}

export function readableMeshName(meshName: string) {
  const cleaned = normalizeAnatomyName(meshName);
  if (!cleaned) return "未命名解剖结构";
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
