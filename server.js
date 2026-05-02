const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

function fallbackPlan(lesson, style, totalMin, t0, t1, t2) {
  const diff = style?.difficulty || 'medium';
  const lt = style?.lesson_type || 'new';
  const pct = { easy: 90, medium: 82, hard: 75 }[diff] || 82;
  const hw = {
    new: `البحث عن أمثلة إضافية على ${lesson.lesson} وكتابة ملاحظات`,
    review: `حل تمارين المراجعة المتعلقة بـ${lesson.lesson} من الكتاب`,
    application: `حل ٥ مسائل إضافية على ${lesson.lesson}`,
    assessment: `مراجعة الأخطاء في الاختبار وتصحيحها`,
  }[lt] || `واجب متعلق بـ${lesson.lesson}`;

  return {
    general_goals: [
      `أن يتعرّف الطالب على مفهوم ${lesson.lesson}`,
      `أن يُطبّق المهارات المرتبطة بـ${lesson.lesson}`,
      `أن يُحلّل ويُقيّم نتائج تعلّمه`,
      `أن يربط ${lesson.lesson} بتطبيقات واقعية في ${lesson.subject}`,
    ],
    acquired_skills: [
      `فهم وشرح ${lesson.lesson}`,
      `تطبيق مفاهيم ${lesson.subject} العملية`,
      `مهارات التفكير النقدي والتحليل`,
      `حل المشكلات المرتبطة بالدرس`,
    ],
    key_concepts: [
      `المفهوم الرئيسي لـ${lesson.lesson}`,
      `التطبيق العملي في ${lesson.subject}`,
      `الربط بالمنهج الدراسي للصف ${lesson.grade}`,
    ],
    activities: [
      { phase: 'التهيئة', time: `الدقائق 0–${t0}`, desc: `استثارة اهتمام الطلاب بسؤال أو موقف مرتبط بـ${lesson.lesson}`, materials: 'السبورة' },
      { phase: 'العرض والشرح', time: `الدقائق ${t0}–${t1}`, desc: `شرح محتوى ${lesson.lesson} بأسلوب واضح مع أمثلة`, materials: 'الكتاب المدرسي، البروجكتور' },
      { phase: 'التطبيق', time: `الدقائق ${t1}–${t2}`, desc: `تطبيق عملي على ${lesson.lesson} فردياً أو جماعياً`, materials: 'أوراق العمل' },
      { phase: 'التقويم', time: `الدقائق ${t2}–${totalMin}`, desc: `تقييم مستوى التحقق من أهداف ${lesson.lesson}`, materials: 'بطاقة التقييم' },
    ],
    teaching_strategies: ['التعلم النشط', 'التعلم التعاوني', 'التغذية الراجعة الفورية'],
    differentiation: {
      advanced: `تكليف بمهمة إثرائية تتجاوز أهداف ${lesson.lesson}`,
      struggling: `تقديم دعم فردي وتبسيط مفاهيم ${lesson.lesson}`,
    },
    assessment_tools: ['ملاحظة المشاركة', 'مهمة صفية', 'اختبار قصير'],
    homework: hw,
    success_criteria: `إتقان ${lesson.lesson} بنسبة ${pct}% وأعلى`,
    success_pct: pct,
    teacher_notes: `ركّز على الجوانب العملية لدرس ${lesson.lesson} ومراعاة الفروقات الفردية بين طلاب ${lesson.grade}`,
  };
}

function fallbackInfographic(lesson) {
  return {
    title: `ملخص درس ${lesson.lesson}`,
    subtitle: `عرض مختصر للمفاهيم الأساسية والخطوات`,
    sections: [
      { icon: '🧠', color: '#2D9E8A', title: 'المفاهيم الرئيسية', points: [`${lesson.lesson} في سياق ${lesson.subject}`, 'فكرة أساسية واحدة', 'مصطلح مهم'] },
      { icon: '📝', color: '#4A7FA5', title: 'خطوات التطبيق', points: ['مراجعة الأمثلة', 'تطبيق عملي', 'مناقشة النتائج'] },
      { icon: '⭐', color: '#E8A53A', title: 'أمثلة', points: ['مثال توضيحي', 'سؤال تطبيقي', 'نشاط صفّي'] },
      { icon: '✅', color: '#7B6FA5', title: 'نتائج التعلم', points: ['فهم واضح', 'استخدام المهارة', 'تقييم ذاتي'] },
    ],
    footer: `الدرس يُسهم في تحسين مهارات ${lesson.subject} لطلاب ${lesson.grade}`,
  };
}

// Generate Lesson Plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { lesson, style, totalMin, t0, t1, t2 } = req.body;

    const lessonTypeLabel = {
      new: 'درس جديد',
      review: 'مراجعة وتكرار',
      application: 'درس تطبيقي',
      assessment: 'درس تقييمي',
    }[style.lesson_type || 'new'];

    const diffLabel = {
      easy: 'سهل (مفاهيم مألوفة)',
      medium: 'متوسط (يحتاج شرحاً)',
      hard: 'صعب (مفاهيم معقدة)',
    }[style.difficulty || 'medium'];

    const STYLE_MAP = {
      grouping: { group: 'جماعية', individual: 'فردية', mixed: 'مزيجة' },
      approach: { theory: 'نظري', practical: 'تطبيقي', balanced: 'متوازن' },
      interaction: { questions: 'نقاشي', lecture: 'إلقائي', discovery: 'استكشافي' },
      assessment: { quiz: 'اختبار قصير', observation: 'ملاحظة', homework: 'واجب منزلي' },
      tools: { board: 'سبورة وكتاب', digital: 'رقمي', handson: 'أدوات ملموسة' },
      lesson_type: { new: 'درس جديد', review: 'مراجعة', application: 'تطبيقي', assessment: 'تقييمي' },
      difficulty: { easy: 'سهل', medium: 'متوسط', hard: 'صعب' },
    };

    const langName = { ar: 'العربية', en: 'English', he: 'עברית' }[lesson.lang] || 'العربية';

    const prompt = `أنت خبير تربوي ومعلم متخصص في مادة "${lesson.subject}". أعدّ خطة درس دقيقة ومخصصة.

━━━ بيانات الدرس ━━━
• المادة: ${lesson.subject}
• الصف: ${lesson.grade}
• الوحدة: ${lesson.unit || 'غير محددة'}
• عنوان الدرس: ${lesson.lesson}
• نوع الدرس: ${lessonTypeLabel}
• مستوى الصعوبة: ${diffLabel}
• المدة: ${totalMin} دقيقة (${lesson.periods} حصة)
• لغة التدريس: ${langName}
• أسلوب المجموعات: ${STYLE_MAP.grouping[style.grouping]}
• المنهج: ${STYLE_MAP.approach[style.approach]}
• التفاعل: ${STYLE_MAP.interaction[style.interaction]}
• الأدوات: ${STYLE_MAP.tools[style.tools]}

التوزيع الزمني المطلوب:
• التهيئة: الدقائق 0–${t0} (${t0} دقيقة)
• العرض والشرح: الدقائق ${t0}–${t1} (${t1-t0} دقيقة)
• التطبيق: الدقائق ${t1}–${t2} (${t2-t1} دقيقة)
• التقويم: الدقائق ${t2}–${totalMin} (${totalMin-t2} دقيقة)

تعليمات مهمة:
1. كل محتوى الخطة يجب أن يكون خاصاً بمادة "${lesson.subject}" ودرس "${lesson.lesson}" تحديداً
2. الأنشطة تختلف حسب نوع الدرس: "${lessonTypeLabel}" — فلا تستخدم نمطاً واحداً لكل الدروس
3. أدوات التقييم تتناسب مع نوع الدرس (${lessonTypeLabel}) وصعوبته (${diffLabel})
4. معيار النجاح يعكس مستوى الصعوبة: للدروس الصعبة نسبة أقل، للسهلة أعلى
5. الواجب المنزلي يختلف: للمراجعة تمارين، للجديد بحث، للتطبيقي مسائل إضافية
6. ملاحظات المعلم يجب أن تكون نصيحة مهنية حقيقية خاصة بهذا الدرس وهذه المادة
7. اكتب الخطة بلغة التدريس: ${langName}
8. لا تستخدم "undefined" أو قيم فارغة — كل حقل يجب أن يحتوي محتوى حقيقياً

أنتج JSON فقط بدون أي نص خارجه:
{
  "general_goals": ["هدف 1 قابل للقياس","هدف 2","هدف 3","هدف 4"],
  "acquired_skills": ["مهارة محددة 1","مهارة 2","مهارة 3","مهارة 4"],
  "key_concepts": ["مفهوم أساسي 1: تعريف دقيق","مفهوم 2: تعريف","مفهوم 3: تعريف"],
  "activities": [
    {"phase":"التهيئة","time":"الدقائق 0–${t0}","desc":"نشاط تهيئة مناسب لـ${lessonTypeLabel} في ${lesson.subject}","materials":"أدوات محددة"},
    {"phase":"العرض والشرح","time":"الدقائق ${t0}–${t1}","desc":"محتوى العرض الفعلي لدرس ${lesson.lesson}","materials":"أدوات العرض"},
    {"phase":"التطبيق","time":"الدقائق ${t1}–${t2}","desc":"تمارين وأنشطة تطبيقية خاصة بـ${lesson.lesson}","materials":"المواد المطلوبة"},
    {"phase":"التقويم","time":"الدقائق ${t2}–${totalMin}","desc":"أسلوب تقييم مناسب لـ${lessonTypeLabel} ومستوى ${diffLabel}","materials":"أداة التقييم"}
  ],
  "teaching_strategies": ["استراتيجية مناسبة لـ${lessonTypeLabel} في ${lesson.subject}","استراتيجية 2","استراتيجية 3"],
  "differentiation": {
    "advanced":"تحدٍّ إثرائي محدد يتجاوز أهداف ${lesson.lesson}",
    "struggling":"دعم مبسّط لمفاهيم ${lesson.lesson} الصعبة"
  },
  "assessment_tools": ["أداة تقييم مناسبة لـ${lessonTypeLabel}","أداة 2","أداة 3"],
  "homework": "واجب مناسب لـ${lessonTypeLabel} في ${lesson.subject} — درس ${lesson.lesson}",
  "success_criteria": "معيار قابل للقياس يعكس صعوبة ${diffLabel} لدرس ${lesson.lesson}",
  "success_pct": ${style.difficulty === 'easy' ? 90 : style.difficulty === 'medium' ? 82 : 75},
  "teacher_notes": "نصيحة مهنية فريدة خاصة بتدريس ${lesson.lesson} في ${lesson.subject} للصف ${lesson.grade}"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = content.replace(/```json|```/g, '').trim();
    let plan;
    try {
      plan = JSON.parse(jsonMatch);
    } catch (parseError) {
      console.error('Plan parse failed:', parseError.message);
      plan = null;
    }

    if (!plan || !Array.isArray(plan.activities) || plan.activities.length === 0) {
      console.error('Plan validation failed, using fallback plan');
      plan = fallbackPlan(lesson, style, totalMin, t0, t1, t2);
    }

    res.json(plan);
  } catch (error) {
    console.error('Error generating plan:', error);
    const { lesson, style, totalMin, t0, t1, t2 } = req.body;
    res.json(fallbackPlan(lesson || {}, style || {}, totalMin || 45, t0 || 5, t1 || 25, t2 || 35));
  }
});

// Generate Infographic
app.post('/api/generate-infographic', async (req, res) => {
  try {
    const { lesson } = req.body;

    const prompt = `أنت مصمم إنفوجرافيك تعليمي. أنتج JSON فقط لإنفوجرافيك تعليمي عن:
المادة: ${lesson.subject} | الدرس: ${lesson.lesson} | الصف: ${lesson.grade}

JSON format:
{"title":"عنوان قصير جذاب","subtitle":"جملة توضيحية","sections":[{"icon":"رمز","color":"#2D9E8A","title":"عنوان القسم","points":["نقطة 1","نقطة 2","نقطة 3"]}],"footer":"خلاصة الدرس في جملة"}

تأكد من وجود 4 أقسام متنوعة تشمل: المفاهيم الرئيسية، خطوات التطبيق، أمثلة، نتائج التعلم.
الألوان: استخدم #2D9E8A أو #4A7FA5 أو #E8A53A أو #7B6FA5
أنتج JSON فقط بدون أي نص خارجه.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = content.replace(/```json|```/g, '').trim();
    let infographic;
    try {
      infographic = JSON.parse(jsonMatch);
    } catch (parseError) {
      console.error('Infographic parse failed:', parseError.message);
      infographic = null;
    }

    if (!infographic || !Array.isArray(infographic.sections) || infographic.sections.length === 0) {
      console.error('Infographic validation failed, using fallback infographic');
      infographic = fallbackInfographic(lesson || {});
    }

    res.json(infographic);
  } catch (error) {
    console.error('Error generating infographic:', error);
    res.json(fallbackInfographic(req.body.lesson || {}));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
