"use client";

import { useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type BodyView = "front" | "back";

type Muscle = {
  id: string;
  name: string;
  english: string;
  view: BodyView;
  region: "上肢" | "躯干" | "下肢";
  position: { x: number; y: number };
  summary: string;
  functions: string[];
  training: { name: string; dose: string; cue: string }[];
  recovery: { name: string; dose: string; cue: string }[];
  caution: string;
};

const MUSCLES: Muscle[] = [
  {
    id: "deltoid",
    name: "三角肌",
    english: "Deltoid",
    view: "front",
    region: "上肢",
    position: { x: 36.5, y: 19.5 },
    summary: "包裹肩关节的主力肌群，决定手臂抬起、前推和肩部轮廓。",
    functions: ["中束负责肩外展，把手臂抬向身体两侧", "前束协助肩屈与内旋，参与推举和卧推", "后束协助肩伸与外旋，稳定肩胛与肱骨"],
    training: [
      { name: "哑铃推举", dose: "3–4 组 × 6–10 次", cue: "肋骨收住，前臂尽量垂直" },
      { name: "侧平举", dose: "3–4 组 × 12–20 次", cue: "用肘带动，避免耸肩借力" },
      { name: "反向飞鸟", dose: "3 组 × 12–18 次", cue: "肩胛稳定，手臂向外展开" },
    ],
    recovery: [
      { name: "横臂拉伸", dose: "每侧 30 秒 × 2", cue: "肩膀远离耳朵，不要硬压关节" },
      { name: "球压后肩", dose: "每侧 60–90 秒", cue: "靠墙缓慢滚动，避开骨点" },
    ],
    caution: "抬手出现夹挤样锐痛时先停止训练，不要用“硬拉开”代替评估。",
  },
  {
    id: "chest",
    name: "胸大肌",
    english: "Pectoralis major",
    view: "front",
    region: "躯干",
    position: { x: 43.5, y: 25 },
    summary: "连接胸骨、锁骨与肱骨，让上臂向身体中线靠拢，是所有推类动作的核心。",
    functions: ["肩水平内收：将张开的手臂合向胸前", "肩内旋与内收：参与推、抱与攀爬动作", "锁骨部协助肩屈，胸肋部协助上臂从高位下拉"],
    training: [
      { name: "卧推", dose: "3–5 组 × 5–10 次", cue: "肩胛后缩下沉，前臂垂直地面" },
      { name: "俯卧撑", dose: "3 组 × 接近力竭", cue: "头到脚保持直线，胸口主动下沉" },
      { name: "绳索夹胸", dose: "3 组 × 12–15 次", cue: "想象用上臂夹住胸口，而非手掌碰拢" },
    ],
    recovery: [
      { name: "门框拉伸", dose: "每侧 30–45 秒 × 2", cue: "小步向前，肩头不要顶向前" },
      { name: "呼吸扩胸", dose: "5 次慢呼吸", cue: "仰卧打开双臂，吸气时扩张胸廓" },
    ],
    caution: "训练时肩前侧疼痛，常与肩胛位置或动作幅度有关，应先减重并缩短行程。",
  },
  {
    id: "biceps",
    name: "肱二头肌",
    english: "Biceps brachii",
    view: "front",
    region: "上肢",
    position: { x: 34.5, y: 30.5 },
    summary: "横跨肩与肘，负责弯曲手肘和把手掌旋向上方。",
    functions: ["屈肘：把前臂拉近上臂", "前臂旋后：把手掌转向上方", "长头协助稳定肱骨头并轻度参与肩屈"],
    training: [
      { name: "反手引体", dose: "3–4 组 × 4–10 次", cue: "先下沉肩胛，再把胸口拉向横杠" },
      { name: "哑铃弯举", dose: "3 组 × 8–12 次", cue: "上臂固定，顶部主动旋掌向上" },
      { name: "上斜弯举", dose: "3 组 × 10–15 次", cue: "肩膀留在身后，控制底部拉长" },
    ],
    recovery: [
      { name: "墙面二头肌拉伸", dose: "每侧 25–30 秒 × 2", cue: "手掌贴墙，身体缓慢转开" },
      { name: "轻柔滚压", dose: "每侧 60 秒", cue: "沿肌腹移动，不直接压肘窝" },
    ],
    caution: "肘窝或肩前出现针刺感时不要继续做大幅度负重弯举。",
  },
  {
    id: "forearm",
    name: "前臂肌群",
    english: "Forearm flexors",
    view: "front",
    region: "上肢",
    position: { x: 30.2, y: 38.5 },
    summary: "由多条屈肌、伸肌与旋转肌组成，控制手腕、手指和握力。",
    functions: ["屈伸手腕与手指，维持器械握持", "旋前与旋后，让手掌向下或向上", "在推拉动作中稳定腕关节并传递力量"],
    training: [
      { name: "农夫行走", dose: "3 组 × 30–45 秒", cue: "腕保持中立，肩胛自然下沉" },
      { name: "腕屈伸", dose: "2–3 组 × 15–20 次", cue: "重量轻，完整控制上下行程" },
      { name: "悬垂", dose: "3 组 × 20–40 秒", cue: "握紧横杠，不要用疼痛换时长" },
    ],
    recovery: [
      { name: "腕屈肌拉伸", dose: "每侧 30 秒 × 2", cue: "伸直手肘，手指轻轻向后" },
      { name: "前臂滚压", dose: "每侧 60 秒", cue: "从肘下到腕上缓慢滚动" },
    ],
    caution: "持续手麻或放射到手指的疼痛可能并非单纯肌肉紧张，应及时评估。",
  },
  {
    id: "abs",
    name: "腹直肌",
    english: "Rectus abdominis",
    view: "front",
    region: "躯干",
    position: { x: 47.3, y: 34.8 },
    summary: "纵向覆盖腹部前侧，弯曲躯干并抵抗腰椎过度伸展。",
    functions: ["躯干屈曲，让胸廓靠近骨盆", "后倾骨盆，限制腰椎过度前凸", "与深层核心协同制造腹内压，稳定脊柱"],
    training: [
      { name: "反向卷腹", dose: "3 组 × 10–15 次", cue: "卷起骨盆，而不是甩动双腿" },
      { name: "死虫", dose: "3 组 × 每侧 8–12 次", cue: "腰背轻贴地面，缓慢呼气" },
      { name: "健腹轮", dose: "3 组 × 6–12 次", cue: "臀部收紧，避免腰椎塌陷" },
    ],
    recovery: [
      { name: "俯卧撑地伸展", dose: "20–30 秒 × 2", cue: "只到腹部有拉伸感，腰部不挤压" },
      { name: "90/90 呼吸", dose: "5 次慢呼吸", cue: "长呼气让肋骨回落、腹壁放松" },
    ],
    caution: "核心训练追求的是控制，不是反复把腰压向疼痛区。",
  },
  {
    id: "obliques",
    name: "腹斜肌",
    english: "External oblique",
    view: "front",
    region: "躯干",
    position: { x: 40.8, y: 38.5 },
    summary: "包围腹部侧面，负责旋转、侧屈与对抗身体被扭转。",
    functions: ["同侧侧屈与对侧旋转躯干", "与对侧腹斜肌协同抗旋转", "压缩腹腔并稳定骨盆与胸廓关系"],
    training: [
      { name: "Pallof 抗旋转", dose: "3 组 × 每侧 10–12 次", cue: "骨盆正对前方，手臂缓慢伸出" },
      { name: "侧桥", dose: "3 组 × 每侧 25–40 秒", cue: "耳、肩、髋、踝连成直线" },
      { name: "绳索砍木", dose: "3 组 × 每侧 10–15 次", cue: "胸廓与骨盆协调转动" },
    ],
    recovery: [
      { name: "跪姿侧向伸展", dose: "每侧 30 秒 × 2", cue: "向斜上方延伸，保持均匀呼吸" },
      { name: "开放书式", dose: "每侧 6–8 次", cue: "膝盖并拢，胸椎缓慢旋转" },
    ],
    caution: "旋转动作应来自髋与胸椎协同，避免把所有扭力集中到腰椎。",
  },
  {
    id: "adductors",
    name: "大腿内收肌",
    english: "Hip adductors",
    view: "front",
    region: "下肢",
    position: { x: 44.4, y: 50.5 },
    summary: "位于大腿内侧，把腿拉向身体中线，并在深蹲与变向时稳定髋部。",
    functions: ["髋内收，让大腿靠近中线", "部分肌束协助髋屈或髋伸", "单腿支撑时帮助控制骨盆与膝盖轨迹"],
    training: [
      { name: "哥本哈根侧桥", dose: "3 组 × 每侧 15–30 秒", cue: "先从膝支撑版本开始" },
      { name: "侧向弓步", dose: "3 组 × 每侧 8–12 次", cue: "坐向一侧髋部，另一腿保持延展" },
      { name: "宽距深蹲", dose: "3–4 组 × 8–12 次", cue: "膝盖与脚尖同向" },
    ],
    recovery: [
      { name: "青蛙式摇摆", dose: "8–10 次慢速", cue: "保持脊柱中立，小幅前后移动" },
      { name: "内侧大腿滚压", dose: "每侧 60 秒", cue: "从膝上滚向腹股沟下方，避开关节" },
    ],
    caution: "腹股沟拉伤后不要立刻进行大幅横向拉伸，应先恢复无痛收缩。",
  },
  {
    id: "quadriceps",
    name: "股四头肌",
    english: "Quadriceps",
    view: "front",
    region: "下肢",
    position: { x: 42.5, y: 59.5 },
    summary: "大腿前侧四块肌肉的总称，是伸直膝盖、跑跳和下蹲起身的主力。",
    functions: ["伸膝：把小腿从弯曲位置伸直", "股直肌跨过髋关节，额外参与髋屈", "落地与下楼时离心控制膝关节弯曲"],
    training: [
      { name: "深蹲", dose: "3–5 组 × 5–10 次", cue: "膝盖跟随脚尖方向，脚掌三点压地" },
      { name: "保加利亚分腿蹲", dose: "3 组 × 每侧 8–12 次", cue: "躯干稍直立，让前膝自然前移" },
      { name: "腿屈伸", dose: "3 组 × 12–15 次", cue: "顶部停顿，下降过程保持控制" },
    ],
    recovery: [
      { name: "靠墙髋屈肌拉伸", dose: "每侧 30–45 秒 × 2", cue: "收紧臀部，避免腰椎代偿" },
      { name: "大腿前侧滚压", dose: "每侧 60–90 秒", cue: "缓慢滚动，找到紧张点后停留呼吸" },
    ],
    caution: "膝盖疼不等于不能训练股四头肌；优先选择无痛幅度并逐步增加负荷。",
  },
  {
    id: "tibialis",
    name: "胫骨前肌",
    english: "Tibialis anterior",
    view: "front",
    region: "下肢",
    position: { x: 41.8, y: 74.1 },
    summary: "位于小腿前外侧，抬起脚尖并控制脚掌落地。",
    functions: ["踝背屈：把脚背拉向小腿", "协助足部内翻并维持足弓", "跑步着地后离心控制前脚掌落下"],
    training: [
      { name: "靠墙勾脚", dose: "3 组 × 15–25 次", cue: "脚跟不离地，尽量抬高脚尖" },
      { name: "脚跟行走", dose: "3 组 × 20–30 米", cue: "步幅小，脚尖始终抬起" },
      { name: "弹力带背屈", dose: "3 组 × 12–20 次", cue: "只移动脚踝，回程慢放" },
    ],
    recovery: [
      { name: "跪姿小腿前侧拉伸", dose: "20–30 秒 × 2", cue: "脚背贴地，逐步向后坐" },
      { name: "轻柔滚压", dose: "每侧 45–60 秒", cue: "压肌肉外侧，不直接压胫骨" },
    ],
    caution: "胫骨边缘持续局部痛或跳跃痛时，应排除应力性损伤。",
  },
  {
    id: "trapezius",
    name: "斜方肌",
    english: "Trapezius",
    view: "back",
    region: "躯干",
    position: { x: 47.2, y: 20.8 },
    summary: "从颈后覆盖到中背，分上、中、下三束共同控制肩胛骨。",
    functions: ["上束上提并协助肩胛上回旋", "中束让肩胛骨后缩靠拢", "下束下压肩胛，并与上束共同完成上回旋"],
    training: [
      { name: "农夫行走", dose: "3 组 × 30–45 秒", cue: "身体高立，肩膀自然稳定" },
      { name: "胸托划船", dose: "3–4 组 × 8–12 次", cue: "先移动肩胛，再拉动手肘" },
      { name: "俯卧 Y 举", dose: "3 组 × 12–15 次", cue: "拇指向上，动作轻而慢" },
    ],
    recovery: [
      { name: "上斜方肌拉伸", dose: "每侧 25–30 秒 × 2", cue: "头向对侧前方轻轻点下" },
      { name: "靠墙球压", dose: "每侧 60–90 秒", cue: "在肩胛内侧移动，避开颈椎" },
    ],
    caution: "“放松斜方肌”不等于永远压低肩膀；它也需要有力地完成肩胛上回旋。",
  },
  {
    id: "rear-deltoid",
    name: "三角肌后束",
    english: "Posterior deltoid",
    view: "back",
    region: "上肢",
    position: { x: 58.8, y: 24.5 },
    summary: "位于肩后侧，负责把上臂向后与向外带，是肩部平衡的重要一环。",
    functions: ["肩伸：把上臂拉向身体后方", "肩水平外展：把手臂从胸前展开", "协助肩外旋并维持肱骨头稳定"],
    training: [
      { name: "反向飞鸟", dose: "3–4 组 × 12–20 次", cue: "手臂展开而不是夹死肩胛" },
      { name: "面拉", dose: "3 组 × 12–18 次", cue: "绳索拉向眉毛，手肘向外" },
      { name: "高位划船", dose: "3 组 × 10–15 次", cue: "上臂与躯干约成 60–80 度" },
    ],
    recovery: [
      { name: "横臂拉伸", dose: "每侧 30 秒 × 2", cue: "避免肩头耸向耳朵" },
      { name: "后肩球压", dose: "每侧 60 秒", cue: "靠墙小范围滚动" },
    ],
    caution: "后肩动作不需要追求大重量，肩胛失控时容易变成上背代偿。",
  },
  {
    id: "triceps",
    name: "肱三头肌",
    english: "Triceps brachii",
    view: "back",
    region: "上肢",
    position: { x: 61.2, y: 31.3 },
    summary: "覆盖上臂后侧，三条肌头共同伸直手肘，长头还参与肩伸。",
    functions: ["伸肘：完成推起、投掷和支撑", "长头协助肩伸与肩内收", "闭链支撑中稳定肘关节"],
    training: [
      { name: "窄距卧推", dose: "3–4 组 × 6–10 次", cue: "手肘不过度外展，腕保持中立" },
      { name: "绳索下压", dose: "3 组 × 10–15 次", cue: "上臂固定，底部完全伸肘" },
      { name: "过顶臂屈伸", dose: "3 组 × 10–15 次", cue: "肋骨收住，感受长头拉长" },
    ],
    recovery: [
      { name: "过顶三头肌拉伸", dose: "每侧 30 秒 × 2", cue: "手肘指向上方，不挤压颈部" },
      { name: "轻柔滚压", dose: "每侧 60 秒", cue: "沿上臂后侧移动，避开肘尖" },
    ],
    caution: "肘后侧疼痛时先减少锁死式伸肘和高容量下压。",
  },
  {
    id: "lats",
    name: "背阔肌",
    english: "Latissimus dorsi",
    view: "back",
    region: "躯干",
    position: { x: 54.5, y: 34.5 },
    summary: "覆盖中下背的大面积肌肉，把上臂拉向身体并向后伸展。",
    functions: ["肩伸与内收：把上臂从前上方拉回身体", "肩内旋，并参与攀爬、划船与引体", "通过胸腰筋膜协助连接上肢与骨盆力量"],
    training: [
      { name: "引体向上", dose: "3–5 组 × 4–10 次", cue: "肩胛先下沉，手肘向髋部靠近" },
      { name: "高位下拉", dose: "3–4 组 × 8–12 次", cue: "胸口上提，不要向后大幅摆动" },
      { name: "单臂划船", dose: "3 组 × 每侧 8–12 次", cue: "沿髋部方向拉肘，控制肩胛前伸" },
    ],
    recovery: [
      { name: "婴儿式侧伸", dose: "每侧 30–45 秒 × 2", cue: "双手移向对侧，向后坐髋" },
      { name: "泡沫轴滚压", dose: "每侧 60–90 秒", cue: "从腋下沿背侧滚动，避免压肋骨" },
    ],
    caution: "下拉时手臂麻木或肩前夹痛，不要强行追求更宽握距。",
  },
  {
    id: "erectors",
    name: "竖脊肌",
    english: "Erector spinae",
    view: "back",
    region: "躯干",
    position: { x: 48, y: 41.8 },
    summary: "沿脊柱两侧纵向排列，维持身体直立并控制躯干前屈。",
    functions: ["双侧收缩伸展脊柱，维持直立", "单侧收缩协助躯干侧屈", "髋铰链与负重动作中等长稳定脊柱"],
    training: [
      { name: "罗马尼亚硬拉", dose: "3–4 组 × 6–10 次", cue: "髋部向后，脊柱保持长而稳定" },
      { name: "俯卧挺身", dose: "3 组 × 10–15 次", cue: "从髋部折叠，不在顶部过伸腰椎" },
      { name: "鸟狗式", dose: "3 组 × 每侧 8–12 次", cue: "骨盆保持水平，手脚向远处延伸" },
    ],
    recovery: [
      { name: "婴儿式呼吸", dose: "5–8 次慢呼吸", cue: "吸气时感受后腰与背部扩张" },
      { name: "猫牛式", dose: "6–10 次慢速", cue: "逐节活动，幅度以舒适为准" },
    ],
    caution: "急性腰痛时不建议直接用泡沫轴重压脊柱，应先寻找舒适活动范围。",
  },
  {
    id: "glutes",
    name: "臀肌群",
    english: "Gluteal muscles",
    view: "back",
    region: "下肢",
    position: { x: 54.5, y: 49.3 },
    summary: "臀大肌负责髋伸，臀中小肌稳定骨盆，共同支持走、跑、蹲和单腿动作。",
    functions: ["臀大肌伸髋与外旋，是起身和加速的主力", "臀中小肌外展髋部并稳定单腿骨盆", "落地和下蹲时控制股骨位置"],
    training: [
      { name: "杠铃臀推", dose: "3–4 组 × 6–12 次", cue: "顶部收臀，避免腰椎过伸" },
      { name: "分腿蹲", dose: "3 组 × 每侧 8–12 次", cue: "前脚全掌发力，髋膝同步弯曲" },
      { name: "罗马尼亚硬拉", dose: "3–4 组 × 6–10 次", cue: "髋后移，感受臀部与腿后侧拉长" },
    ],
    recovery: [
      { name: "4 字拉伸", dose: "每侧 30–45 秒 × 2", cue: "骨盆保持平稳，缓慢靠近身体" },
      { name: "球压臀肌", dose: "每侧 60–90 秒", cue: "寻找肌腹紧张点，不压坐骨" },
    ],
    caution: "膝内扣往往不只是“臀肌无力”，还与动作策略、足部和负荷有关。",
  },
  {
    id: "hamstrings",
    name: "腘绳肌",
    english: "Hamstrings",
    view: "back",
    region: "下肢",
    position: { x: 54.5, y: 59 },
    summary: "大腿后侧三组主要肌肉，跨过髋和膝，控制髋伸与屈膝。",
    functions: ["屈膝：让脚跟靠近臀部", "伸髋：与臀大肌共同把大腿拉向后方", "奔跑摆动末期离心减速小腿"],
    training: [
      { name: "罗马尼亚硬拉", dose: "3–4 组 × 6–10 次", cue: "小腿近乎垂直，髋部持续后移" },
      { name: "腿弯举", dose: "3 组 × 10–15 次", cue: "骨盆稳定，回程慢放" },
      { name: "北欧腿弯举", dose: "3 组 × 3–8 次", cue: "从髋到膝保持直线，优先控制下降" },
    ],
    recovery: [
      { name: "动态腿后侧伸展", dose: "每侧 8–10 次", cue: "保持背部延展，从髋部前倾" },
      { name: "泡沫轴滚压", dose: "每侧 60–90 秒", cue: "从坐骨下方滚到膝上方" },
    ],
    caution: "冲刺后突然出现后侧刺痛或瘀青，应停止拉伸并尽快评估。",
  },
  {
    id: "calves",
    name: "小腿三头肌",
    english: "Gastrocnemius & soleus",
    view: "back",
    region: "下肢",
    position: { x: 54, y: 72 },
    summary: "腓肠肌与比目鱼肌共同完成跖屈，是走路、跑跳和踮脚的推进器。",
    functions: ["踝跖屈：把脚跟抬离地面", "腓肠肌跨过膝关节，协助屈膝", "步态中储存与释放弹性能量，稳定踝足"],
    training: [
      { name: "站姿提踵", dose: "4 组 × 8–15 次", cue: "底部充分下沉，顶部停顿 1 秒" },
      { name: "坐姿提踵", dose: "3–4 组 × 12–20 次", cue: "屈膝状态更偏向比目鱼肌" },
      { name: "跳绳", dose: "4 组 × 45–60 秒", cue: "轻柔落地，保持均匀节奏" },
    ],
    recovery: [
      { name: "直膝靠墙拉伸", dose: "每侧 30 秒 × 2", cue: "后脚跟压地，脚尖朝前" },
      { name: "屈膝小腿拉伸", dose: "每侧 30 秒 × 2", cue: "保持脚跟不抬，膝盖向前移动" },
    ],
    caution: "跟腱晨起僵硬或跳跃疼痛时，应控制冲击量，不要只靠拉伸处理。",
  },
];

const VIEW_DEFAULTS: Record<BodyView, string> = { front: "chest", back: "lats" };

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const [bodyView, setBodyView] = useState<BodyView>("front");
  const [activeId, setActiveId] = useState("chest");
  const [query, setQuery] = useState("");
  const [imageReady, setImageReady] = useState<Record<BodyView, boolean>>({ front: false, back: false });

  const activeMuscle = MUSCLES.find((muscle) => muscle.id === activeId) ?? MUSCLES[0];
  const visibleMuscles = MUSCLES.filter((muscle) => muscle.view === bodyView);
  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return visibleMuscles;
    return MUSCLES.filter((muscle) =>
      `${muscle.name} ${muscle.english} ${muscle.region}`.toLowerCase().includes(keyword),
    );
  }, [query, visibleMuscles]);

  const selectMuscle = (muscle: Muscle) => {
    setActiveId(muscle.id);
    setBodyView(muscle.view);
  };

  const changeView = (nextView: BodyView) => {
    setBodyView(nextView);
    setActiveId(VIEW_DEFAULTS[nextView]);
    setQuery("");
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="肌图首页">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>肌图 <b>MUSCLE MAP</b></span>
        </a>
        <nav className="topnav" aria-label="主要导航">
          <a href="#explorer">肌群图谱</a>
          <a href="#guide">使用指南</a>
        </nav>
        <a className="header-cta" href="#explorer">开始探索 <ArrowIcon /></a>
      </header>

      <section className="intro" id="top">
        <div>
          <p className="eyebrow"><span /> 人体肌群交互图谱</p>
          <h1>看懂每一次<br /><em>发力。</em></h1>
        </div>
        <div className="intro-copy">
          <p>从结构出发，理解动作。点击人体上的肌群，快速掌握它的功能、训练方法与恢复策略。</p>
          <div className="intro-stat">
            <strong>{MUSCLES.length}</strong>
            <span>个关键肌群<br />持续扩充中</span>
          </div>
        </div>
      </section>

      <section className="explorer" id="explorer">
        <div className="anatomy-card">
          <div className="card-toolbar">
            <div className="view-switch" role="group" aria-label="选择人体视角">
              <button className={bodyView === "front" ? "active" : ""} onClick={() => changeView("front")} aria-pressed={bodyView === "front"}>正面</button>
              <button className={bodyView === "back" ? "active" : ""} onClick={() => changeView("back")} aria-pressed={bodyView === "back"}>背面</button>
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索肌群，中英文均可" aria-label="搜索肌群" />
              {query && <button onClick={() => setQuery("")} aria-label="清除搜索">×</button>}
            </label>
          </div>

          <div className="anatomy-stage">
            <div className="stage-note"><span className="pulse-dot" /> 点击发光标记查看肌群</div>
            {!imageReady[bodyView] && <div className="image-skeleton"><Skeleton height="100%" borderRadius={28} baseColor="#eeeae2" highlightColor="#faf8f3" /></div>}
            <div className={`anatomy-image-wrap ${imageReady[bodyView] ? "ready" : ""}`}>
              <img
                src={bodyView === "front" ? "/anterior-muscles.jpg" : "/posterior-muscles.jpg"}
                alt={bodyView === "front" ? "人体主要肌肉正面解剖图" : "人体主要肌肉背面解剖图"}
                onLoad={() => setImageReady((state) => ({ ...state, [bodyView]: true }))}
              />
              {visibleMuscles.map((muscle) => (
                <button
                  key={muscle.id}
                  className={`hotspot ${activeId === muscle.id ? "active" : ""}`}
                  style={{ left: `${muscle.position.x}%`, top: `${muscle.position.y}%` }}
                  onClick={() => selectMuscle(muscle)}
                  aria-label={`查看${muscle.name}`}
                  aria-pressed={activeId === muscle.id}
                  data-label={muscle.name}
                ><span /></button>
              ))}
            </div>
          </div>

          <div className="muscle-rail" aria-label="肌群快速选择">
            <div className="rail-meta"><span>{query ? "搜索结果" : bodyView === "front" ? "正面肌群" : "背面肌群"}</span><b>{searchResults.length.toString().padStart(2, "0")}</b></div>
            <div className="muscle-chips">
              {searchResults.map((muscle) => (
                <button key={muscle.id} className={activeId === muscle.id ? "active" : ""} onClick={() => selectMuscle(muscle)}>
                  <span>{muscle.name}</span><small>{muscle.english}</small>
                </button>
              ))}
              {searchResults.length === 0 && <p className="empty-state">暂未找到这个肌群，试试“胸”“腿”或英文名称。</p>}
            </div>
          </div>
          <p className="image-credit">解剖图：CFCF / Wikimedia Commons，<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p>
        </div>

        <aside className="detail-panel" aria-live="polite">
          <div className="detail-head">
            <div>
              <span className="detail-index">{(MUSCLES.findIndex((item) => item.id === activeMuscle.id) + 1).toString().padStart(2, "0")}</span>
              <span className="region-pill">{activeMuscle.region} · {activeMuscle.view === "front" ? "正面" : "背面"}</span>
            </div>
            <p>当前肌群</p>
          </div>

          <div className="muscle-title">
            <h2>{activeMuscle.name}</h2>
            <p>{activeMuscle.english}</p>
          </div>
          <p className="muscle-summary">{activeMuscle.summary}</p>

          <section className="detail-section">
            <div className="section-label"><span>01</span><h3>它如何工作</h3></div>
            <ul className="function-list">
              {activeMuscle.functions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="detail-section">
            <div className="section-label"><span>02</span><h3>怎么训练</h3><small>动作 · 处方 · 要点</small></div>
            <div className="training-list">
              {activeMuscle.training.map((item, index) => (
                <article key={item.name}>
                  <b>{String.fromCharCode(65 + index)}</b>
                  <div><h4>{item.name}</h4><p>{item.cue}</p></div>
                  <strong>{item.dose}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-section recovery-section">
            <div className="section-label"><span>03</span><h3>怎么放松</h3><small>慢一点，以舒适为准</small></div>
            <div className="recovery-grid">
              {activeMuscle.recovery.map((item) => (
                <article key={item.name}>
                  <span className="recovery-icon" aria-hidden="true">↔</span>
                  <h4>{item.name}</h4><strong>{item.dose}</strong><p>{item.cue}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="safety-note"><span>!</span><p><strong>训练提醒</strong>{activeMuscle.caution}</p></div>
        </aside>
      </section>

      <section className="guide" id="guide">
        <p className="eyebrow"><span /> 使用指南</p>
        <div className="guide-layout">
          <h2>先理解，<br />再训练。</h2>
          <div className="guide-steps">
            <article><b>01</b><div><h3>定位肌群</h3><p>切换正面与背面，点击身体标记，或直接搜索名称。</p></div></article>
            <article><b>02</b><div><h3>理解动作</h3><p>先弄清它跨过哪些关节、负责什么，再选择训练动作。</p></div></article>
            <article><b>03</b><div><h3>练后恢复</h3><p>用温和拉伸、呼吸和滚压帮助恢复；疼痛不等于有效。</p></div></article>
          </div>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>肌图 <b>MUSCLE MAP</b></span></div>
        <p>把复杂的人体结构，变成可以理解与实践的知识。</p>
        <p className="disclaimer">内容仅用于学习与一般健身参考，不能替代医生、物理治疗师或其他专业人士的个体评估。</p>
      </footer>
    </main>
  );
}
