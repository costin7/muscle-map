"use client";

import { useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type BodyView = "front" | "back";

type MusclePart = {
  id: string;
  name: string;
  english: string;
  location: string;
  role: string;
  training: string[];
  release: string;
};

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
    id: "rotator-cuff",
    name: "肩袖肌群",
    english: "Rotator cuff",
    view: "back",
    region: "上肢",
    position: { x: 39.5, y: 26 },
    summary: "由四块深层小肌肉组成，像袖口一样包围肱骨头，负责旋转与动态稳定肩关节。",
    functions: ["把肱骨头稳定在肩胛盂中央", "完成肩内旋与外旋", "与三角肌协同，控制抬臂时的关节轨迹"],
    training: [
      { name: "弹力带外旋", dose: "3 组 × 12–20 次", cue: "肘贴身体，肩头保持居中" },
      { name: "侧卧外旋", dose: "3 组 × 10–15 次", cue: "重量轻，缓慢控制离心" },
      { name: "肩胛面抬举", dose: "3 组 × 10–15 次", cue: "手臂在身体前方约 30 度抬起" },
    ],
    recovery: [
      { name: "横臂拉伸", dose: "每侧 25–30 秒 × 2", cue: "保持肩胛稳定，不把肩头推向前" },
      { name: "后肩轻柔球压", dose: "每侧 45–60 秒", cue: "避开肩峰与肱骨头等骨点" },
    ],
    caution: "肩袖训练更看重控制与耐力；出现夜间痛、明显无力或抬臂疼痛弧时应先评估。",
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

const PARTS_BY_MUSCLE: Partial<Record<string, MusclePart[]>> = {
  deltoid: [
    {
      id: "anterior-deltoid",
      name: "前束",
      english: "Anterior deltoid",
      location: "起于锁骨外侧，覆盖肩部前方。",
      role: "主要参与肩屈、肩内旋与水平内收，在推举、卧推前段和向前抬臂时活跃。",
      training: ["哑铃推举", "上斜卧推", "绳索前平举"],
      release: "用门框做低角度胸肩拉伸；肩前有夹痛时不要强压。",
    },
    {
      id: "middle-deltoid",
      name: "中束",
      english: "Middle deltoid",
      location: "起于肩峰，位于肩部最外侧。",
      role: "肩外展的主力，尤其负责手臂由身体侧面抬起，决定肩部横向宽度。",
      training: ["哑铃侧平举", "单臂绳索侧平举", "器械侧平举"],
      release: "横臂拉伸配合后外侧肩部轻柔球压，避免直接压肩峰。",
    },
    {
      id: "posterior-deltoid",
      name: "后束",
      english: "Posterior deltoid",
      location: "起于肩胛冈，覆盖肩关节后方。",
      role: "参与肩伸、水平外展和外旋，帮助平衡大量推类训练带来的前侧优势。",
      training: ["反向飞鸟", "面拉", "高位宽肘划船"],
      release: "横臂拉伸或靠墙滚压后肩肌腹，保持肩胛不向前滑。",
    },
  ],
  chest: [
    {
      id: "clavicular-pec",
      name: "锁骨部",
      english: "Clavicular head",
      location: "位于胸大肌上方，纤维从锁骨斜向肱骨。",
      role: "除水平内收外，更明显地参与肩屈，常被称为“上胸”。",
      training: ["上斜卧推", "低位到高位夹胸", "脚低位俯卧撑"],
      release: "门框拉伸时手臂略低于肩，缓慢转开胸口。",
    },
    {
      id: "sternocostal-pec",
      name: "胸肋部",
      english: "Sternocostal head",
      location: "胸大肌面积最大的中部纤维，起于胸骨和肋软骨。",
      role: "负责强力水平内收和内旋，是平板卧推与俯卧撑的主要贡献者。",
      training: ["平板卧推", "俯卧撑", "水平绳索夹胸"],
      release: "手臂与肩同高做门框拉伸，控制肩头不要向前顶。",
    },
    {
      id: "abdominal-pec",
      name: "腹部纤维",
      english: "Abdominal fibers",
      location: "位于胸大肌下缘，纤维方向由下向外上方。",
      role: "协助把高位上臂拉向下方和身体中线；这是纤维区域，不是独立肌头。",
      training: ["双杠臂屈伸", "高位到低位夹胸", "下斜卧推"],
      release: "手臂稍高于肩做门框拉伸，保持肋骨不过度外翻。",
    },
  ],
  biceps: [
    {
      id: "biceps-long-head",
      name: "长头",
      english: "Long head",
      location: "位于上臂外侧，肌腱跨过肩关节盂上方。",
      role: "屈肘、旋后并协助稳定肩前侧；肩伸位弯举时处于更长肌长。",
      training: ["上斜哑铃弯举", "窄握杠铃弯举", "贝叶斯绳索弯举"],
      release: "肩伸位做温和二头肌拉伸，不直接压肱二头肌长头肌腱。",
    },
    {
      id: "biceps-short-head",
      name: "短头",
      english: "Short head",
      location: "位于上臂内侧，起于肩胛骨喙突。",
      role: "同样负责屈肘与旋后，并更明显参与肩内收；宽握弯举常用于偏向内侧。",
      training: ["宽握杠铃弯举", "牧师凳弯举", "集中弯举"],
      release: "伸直肘并把手掌贴墙，身体小幅转开，避免麻电感。",
    },
  ],
  forearm: [
    {
      id: "wrist-flexors",
      name: "腕屈肌群",
      english: "Wrist flexors",
      location: "前臂掌侧，多数起于肱骨内上髁。",
      role: "屈曲手腕、协助抓握，并在拉类动作中稳定腕部。",
      training: ["正握腕弯举", "毛巾悬垂", "粗握把农夫行走"],
      release: "伸肘、掌心向前，轻拉手指向下后方。",
    },
    {
      id: "wrist-extensors",
      name: "腕伸肌群",
      english: "Wrist extensors",
      location: "前臂背侧，多数起于肱骨外上髁。",
      role: "伸展手腕并在抓握时维持腕中立，常与网球肘负荷相关。",
      training: ["反握腕弯举", "橡皮筋手指外展", "偏心腕伸展"],
      release: "伸肘、掌心向下，轻拉手背向身体方向。",
    },
    {
      id: "pronators",
      name: "旋前肌群",
      english: "Pronators",
      location: "由旋前圆肌和旋前方肌为主，位于前臂前内侧。",
      role: "把手掌转向下方，并在推、投掷和器械握持中稳定前臂。",
      training: ["锤柄旋前", "绳索旋前", "中立握负重转腕"],
      release: "肘贴身体，以无负重方式缓慢旋后到舒适终点。",
    },
    {
      id: "supinators",
      name: "旋后肌群",
      english: "Supinators",
      location: "以旋后肌和肱二头肌为主，分布于近端前臂。",
      role: "把手掌转向上方，在反手拉和弯举动作中参与明显。",
      training: ["哑铃旋后", "反手引体", "旋后位弯举"],
      release: "前臂支撑在桌面，缓慢转为掌心向下，不用另一只手硬压。",
    },
  ],
  abs: [
    {
      id: "upper-rectus",
      name: "上段肌腹",
      english: "Upper region",
      location: "位于腹直肌剑突、肋软骨到脐部之间。",
      role: "卷腹类动作中胸廓向骨盆靠近的感觉更明显；它不是独立的一块肌肉。",
      training: ["绳索卷腹", "健身球卷腹", "负重卷腹"],
      release: "俯卧撑地伸展配合慢呼气，避免腰椎末端挤压。",
    },
    {
      id: "lower-rectus",
      name: "下段肌腹",
      english: "Lower region",
      location: "位于脐部到耻骨之间，与上段连续。",
      role: "骨盆后倾和反向卷腹时体感更强，但无法把它与上段完全隔离。",
      training: ["反向卷腹", "悬垂举膝", "死虫"],
      release: "用 90/90 呼吸放松腹壁，再做小幅髋屈肌伸展。",
    },
  ],
  obliques: [
    {
      id: "external-oblique",
      name: "腹外斜肌",
      english: "External oblique",
      location: "腹壁最表层，纤维由外上向内下走行。",
      role: "同侧侧屈、对侧旋转，并与对侧腹内斜肌形成旋转协同。",
      training: ["绳索砍木", "侧桥", "单侧负重行走"],
      release: "跪姿侧向伸展，向斜上方延伸并保持均匀呼吸。",
    },
    {
      id: "internal-oblique",
      name: "腹内斜肌",
      english: "Internal oblique",
      location: "位于腹外斜肌深层，纤维方向大体相反。",
      role: "同侧旋转与侧屈，参与腹压和骨盆—胸廓稳定。",
      training: ["半跪姿抗旋转", "鸟狗划船", "低位砍木"],
      release: "开放书式配合长呼气，不追求腰椎大幅扭转。",
    },
    {
      id: "transversus-abdominis",
      name: "腹横肌",
      english: "Transversus abdominis",
      location: "腹壁最深层，纤维像腰带一样横向环绕。",
      role: "主要贡献腹内压和躯干刚度，不负责明显的躯干旋转。",
      training: ["死虫", "Pallof 抗旋转", "负重呼吸与行走"],
      release: "仰卧屈膝做环周呼吸，吸气时让侧腰和后腰同时扩张。",
    },
  ],
  adductors: [
    {
      id: "adductor-magnus",
      name: "大收肌",
      english: "Adductor magnus",
      location: "大腿内侧面积最大，后部纤维延伸到股骨内上方。",
      role: "强力髋内收；后部纤维还能像腘绳肌一样参与伸髋。",
      training: ["宽距深蹲", "侧向弓步", "相扑硬拉"],
      release: "青蛙式小幅摇摆，避免拉伤后早期做强力静态拉伸。",
    },
    {
      id: "adductor-longus",
      name: "长收肌",
      english: "Adductor longus",
      location: "位于大腿内侧较表浅，呈扇形向股骨中段展开。",
      role: "髋内收并在部分角度协助髋屈，是变向稳定的重要肌肉。",
      training: ["哥本哈根侧桥", "滑垫侧弓步", "绳索髋内收"],
      release: "仰卧屈膝开髋，保持腹股沟只有温和牵拉感。",
    },
    {
      id: "adductor-brevis",
      name: "短收肌",
      english: "Adductor brevis",
      location: "藏在长收肌深层，连接耻骨与股骨近端。",
      role: "协助髋内收与轻度髋屈，更多作为内收肌群协同工作。",
      training: ["短杠杆哥本哈根侧桥", "坐姿夹球", "低负荷髋内收"],
      release: "采用短幅度蝶式呼吸，不需要追求膝盖贴地。",
    },
    {
      id: "gracilis",
      name: "股薄肌",
      english: "Gracilis",
      location: "沿大腿最内侧纵向走行，是唯一跨过膝关节的主要内收肌。",
      role: "髋内收，同时协助屈膝和小腿内旋。",
      training: ["长杠杆哥本哈根侧桥", "侧向拖雪橇", "弹力带髋内收"],
      release: "伸膝位做侧向髋铰链，动作小而慢。",
    },
    {
      id: "pectineus",
      name: "耻骨肌",
      english: "Pectineus",
      location: "位于腹股沟前内侧，连接耻骨与股骨近端。",
      role: "髋内收并协助髋屈，在抬腿与方向变化中参与。",
      training: ["站姿绳索内收", "低台阶上步", "坐姿夹球等长"],
      release: "半跪姿轻度伸髋并向外移髋，避开腹股沟直接重压。",
    },
  ],
  quadriceps: [
    {
      id: "rectus-femoris",
      name: "股直肌",
      english: "Rectus femoris",
      location: "位于大腿前侧中央，是股四头肌中唯一跨髋、膝两个关节者。",
      role: "伸膝并协助髋屈；髋伸位训练会让它处于更长肌长。",
      training: ["西西深蹲", "后脚抬高分腿蹲", "腿屈伸"],
      release: "靠墙髋屈肌拉伸，主动收臀避免腰椎代偿。",
    },
    {
      id: "vastus-lateralis",
      name: "股外侧肌",
      english: "Vastus lateralis",
      location: "覆盖大腿前外侧，是股四头肌中体积较大的部分。",
      role: "强力伸膝，并与股内侧肌共同控制髌骨轨迹。",
      training: ["深蹲", "哈克深蹲", "腿举"],
      release: "滚压大腿前外侧肌腹，不把髂胫束当作可被“滚松”的肌肉。",
    },
    {
      id: "vastus-medialis",
      name: "股内侧肌",
      english: "Vastus medialis",
      location: "位于大腿前内侧，靠近膝部呈水滴形。",
      role: "伸膝并参与髌骨内侧稳定；无法只靠改变脚尖方向完全隔离。",
      training: ["全幅度深蹲", "台阶下蹲", "腿屈伸末端控制"],
      release: "轻滚膝上内侧肌腹，避免直接压髌骨与内侧关节线。",
    },
    {
      id: "vastus-intermedius",
      name: "股中间肌",
      english: "Vastus intermedius",
      location: "位于股直肌深层，贴近股骨前表面。",
      role: "纯粹参与伸膝，是深层但重要的力量来源。",
      training: ["腿屈伸", "前蹲", "反向拖雪橇"],
      release: "通过大腿前侧整体滚压与主动屈膝活动间接处理。",
    },
  ],
  trapezius: [
    {
      id: "upper-trap",
      name: "上束",
      english: "Upper trapezius",
      location: "从枕骨和颈椎延伸到锁骨外侧。",
      role: "上提并上回旋肩胛，抬臂过头时不是“需要关掉”的肌肉。",
      training: ["农夫行走", "哑铃耸肩", "过顶行走"],
      release: "轻柔侧屈颈部配合呼吸，避免长时间强压颈侧。",
    },
    {
      id: "middle-trap",
      name: "中束",
      english: "Middle trapezius",
      location: "水平连接上胸椎与肩胛冈、肩峰。",
      role: "使肩胛后缩，并在划船动作中稳定肩胛骨。",
      training: ["胸托划船", "俯卧 T 举", "坐姿宽握划船"],
      release: "用球靠墙滚压肩胛内侧肌腹，不直接压脊柱。",
    },
    {
      id: "lower-trap",
      name: "下束",
      english: "Lower trapezius",
      location: "从中下胸椎斜向上连接肩胛冈内侧。",
      role: "下压并上回旋肩胛，与上束、前锯肌共同支持过顶动作。",
      training: ["俯卧 Y 举", "墙面滑动抬离", "单臂高位下压"],
      release: "婴儿式侧伸配合后背呼吸，减少过度挺胸代偿。",
    },
  ],
  "rotator-cuff": [
    {
      id: "supraspinatus",
      name: "冈上肌",
      english: "Supraspinatus",
      location: "位于肩胛冈上方，肌腱从肩峰下穿过。",
      role: "启动肩外展并压稳肱骨头，与三角肌共同完成抬臂。",
      training: ["肩胛面满罐抬举", "轻阻力外展", "等长外展"],
      release: "优先改善胸椎和肩胛活动，不直接重压肩峰下方。",
    },
    {
      id: "infraspinatus",
      name: "冈下肌",
      english: "Infraspinatus",
      location: "覆盖肩胛冈下方的大部分后侧表面。",
      role: "肩外旋的主要肌肉，并在上臂移动时稳定肱骨头。",
      training: ["侧卧外旋", "绳索外旋", "面拉加外旋"],
      release: "用球靠墙滚压肩胛骨表面肌腹，强度保持温和。",
    },
    {
      id: "teres-minor",
      name: "小圆肌",
      english: "Teres minor",
      location: "位于肩胛外侧缘，冈下肌下方。",
      role: "协助肩外旋和轻度内收，在高位手臂稳定中重要。",
      training: ["90/90 外旋", "俯卧外旋", "弹力带外旋走"],
      release: "在后腋窝上方做小范围球压，避开腋窝神经血管区。",
    },
    {
      id: "subscapularis",
      name: "肩胛下肌",
      english: "Subscapularis",
      location: "位于肩胛骨前面、贴近胸廓，是肩袖唯一主要内旋肌。",
      role: "肩内旋并从前方稳定肱骨头，与后三块肩袖形成力偶。",
      training: ["弹力带内旋", "腹前等长内旋", "轻量熊爬"],
      release: "它位置很深，不建议自行强压腋窝；用温和外旋活动代替。",
    },
  ],
  triceps: [
    {
      id: "triceps-long-head",
      name: "长头",
      english: "Long head",
      location: "位于上臂后内侧，起点跨过肩关节。",
      role: "伸肘，同时参与肩伸和内收；手臂过顶时处于更长肌长。",
      training: ["过顶绳索臂屈伸", "仰卧臂屈伸", "窄距卧推"],
      release: "过顶屈肘拉伸，收住肋骨并避免肩前夹挤。",
    },
    {
      id: "triceps-lateral-head",
      name: "外侧头",
      english: "Lateral head",
      location: "位于上臂后外侧，形成常见的马蹄形轮廓。",
      role: "在较高负荷伸肘时贡献明显，不跨过肩关节。",
      training: ["直杆下压", "窄距俯卧撑", "双杠臂屈伸"],
      release: "沿上臂后外侧轻滚，避开肘尖和尺神经区域。",
    },
    {
      id: "triceps-medial-head",
      name: "内侧头",
      english: "Medial head",
      location: "位于长头与外侧头深层，靠近肘部处可见。",
      role: "几乎在所有伸肘负荷下工作，尤其承担低负荷和持续稳定。",
      training: ["反握下压", "绳索下压", "窄距地板卧推"],
      release: "轻柔活动肘关节并滚压上臂后下方，不追求强痛感。",
    },
  ],
  lats: [
    {
      id: "upper-lat-fibers",
      name: "上部纤维",
      english: "Upper fibers",
      location: "更靠近腋后和胸椎区域，纤维方向较水平。",
      role: "偏向肩伸与水平拉动；这是纤维方向，不是独立肌头。",
      training: ["宽肘单臂划船", "胸托划船", "直臂下压"],
      release: "从腋后向下做温和滚压，避免直接压肋骨。",
    },
    {
      id: "lower-lat-fibers",
      name: "下部纤维",
      english: "Lower fibers",
      location: "从胸腰筋膜和髂嵴斜向上汇入肱骨。",
      role: "偏向肩内收和从高位把手肘拉向髋部；同样不是独立肌头。",
      training: ["窄中立握下拉", "单臂髋向下拉", "引体向上"],
      release: "婴儿式把双手移向对侧，长呼气感受侧腰展开。",
    },
  ],
  erectors: [
    {
      id: "iliocostalis",
      name: "髂肋肌",
      english: "Iliocostalis",
      location: "竖脊肌最外侧柱，连接髂骨、肋骨和颈椎。",
      role: "伸展和侧屈脊柱，并在负重时抵抗躯干弯曲。",
      training: ["罗马尼亚硬拉", "单侧负重行走", "45 度挺身"],
      release: "婴儿式侧伸与侧后方呼吸，不直接压肋骨。",
    },
    {
      id: "longissimus",
      name: "最长肌",
      english: "Longissimus",
      location: "竖脊肌中间柱，从骶骨延伸到胸椎、颈椎和颅骨。",
      role: "脊柱伸展和同侧侧屈，是保持直立的重要长肌链。",
      training: ["硬拉", "俯卧挺身", "早安式"],
      release: "用猫牛式和节段呼吸恢复活动，不以强压脊柱为目标。",
    },
    {
      id: "spinalis",
      name: "棘肌",
      english: "Spinalis",
      location: "竖脊肌最内侧柱，紧邻棘突。",
      role: "协助伸展脊柱，更多与其他竖脊肌共同工作。",
      training: ["鸟狗式", "前抱负重深蹲", "等长髋铰链"],
      release: "仰卧屈膝轻抱腿配合呼吸，避免泡沫轴直接滚脊柱。",
    },
  ],
  glutes: [
    {
      id: "glute-max",
      name: "臀大肌",
      english: "Gluteus maximus",
      location: "臀部最表层、体积最大的肌肉。",
      role: "强力伸髋和外旋，负责起身、冲刺和从深屈髋位置发力。",
      training: ["杠铃臀推", "深蹲", "罗马尼亚硬拉"],
      release: "4 字拉伸或球压臀部肌腹，避开坐骨。",
    },
    {
      id: "glute-medius",
      name: "臀中肌",
      english: "Gluteus medius",
      location: "位于髂骨外侧，上部较表浅、下部被臀大肌覆盖。",
      role: "髋外展并稳定单腿骨盆；不同纤维还参与内旋或外旋。",
      training: ["侧向台阶下蹲", "绳索髋外展", "单腿硬拉"],
      release: "靠墙球压髋外侧上方，避开大转子骨点。",
    },
    {
      id: "glute-min",
      name: "臀小肌",
      english: "Gluteus minimus",
      location: "位于臀中肌深层，连接髂骨与股骨大转子。",
      role: "协助髋外展、内旋并把股骨头稳定在髋臼内。",
      training: ["侧卧髋外展", "弹力带侧走", "单腿站立骨盆控制"],
      release: "采用温和髋内外旋活动，不用球深压髋关节前外侧。",
    },
  ],
  hamstrings: [
    {
      id: "biceps-femoris-long",
      name: "股二头肌长头",
      english: "Biceps femoris long head",
      location: "位于大腿后外侧，从坐骨延伸到腓骨头。",
      role: "伸髋、屈膝并外旋小腿，跨过髋和膝两个关节。",
      training: ["罗马尼亚硬拉", "腿弯举", "单腿硬拉"],
      release: "髋铰链式动态拉伸，避开腓骨头附近神经区域。",
    },
    {
      id: "biceps-femoris-short",
      name: "股二头肌短头",
      english: "Biceps femoris short head",
      location: "位于长头深层，仅跨过膝关节。",
      role: "屈膝并外旋小腿，不直接参与伸髋。",
      training: ["坐姿腿弯举", "俯卧腿弯举", "滑垫腿弯举"],
      release: "屈伸膝做主动活动，避免在膝外侧末端强压。",
    },
    {
      id: "semitendinosus",
      name: "半腱肌",
      english: "Semitendinosus",
      location: "大腿后内侧较表浅，下段有较长肌腱。",
      role: "伸髋、屈膝并内旋小腿，与半膜肌协同。",
      training: ["北欧腿弯举", "罗马尼亚硬拉", "瑞士球腿弯举"],
      release: "沿后内侧肌腹轻滚，从坐骨下方到膝上方。",
    },
    {
      id: "semimembranosus",
      name: "半膜肌",
      english: "Semimembranosus",
      location: "位于半腱肌深层，肌腱较宽扁。",
      role: "伸髋、屈膝和内旋小腿，并帮助稳定膝后内侧。",
      training: ["坐姿腿弯举", "长肌长髋铰链", "反向超伸"],
      release: "用主动直腿抬高温和活动，不直接压腘窝。",
    },
  ],
  calves: [
    {
      id: "medial-gastrocnemius",
      name: "腓肠肌内侧头",
      english: "Medial gastrocnemius",
      location: "形成小腿后侧上方较明显的内侧轮廓。",
      role: "膝伸直时贡献跖屈，也协助屈膝和跑跳推进。",
      training: ["站姿提踵", "单腿提踵", "跳绳"],
      release: "直膝靠墙拉伸，脚尖保持朝前。",
    },
    {
      id: "lateral-gastrocnemius",
      name: "腓肠肌外侧头",
      english: "Lateral gastrocnemius",
      location: "位于小腿后外侧，与内侧头共同跨过膝关节。",
      role: "与内侧头共同完成快速跖屈和屈膝，无法靠脚尖方向完全隔离。",
      training: ["站姿提踵", "负重跳跃", "坡跑"],
      release: "直膝小腿拉伸并轻滚肌腹，避开腓骨头。",
    },
    {
      id: "soleus",
      name: "比目鱼肌",
      english: "Soleus",
      location: "位于腓肠肌深层，只跨过踝关节。",
      role: "屈膝位仍能强力跖屈，是站立、步行和耐力跑的重要抗重力肌。",
      training: ["坐姿提踵", "屈膝单腿提踵", "屈膝等长提踵"],
      release: "屈膝向前推的小腿拉伸，脚跟保持着地。",
    },
  ],
};

const PART_COUNT = Object.values(PARTS_BY_MUSCLE).reduce((total, parts) => total + (parts?.length ?? 0), 0);

const VIEW_DEFAULTS: Record<BodyView, string> = { front: "chest", back: "lats" };

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const [bodyView, setBodyView] = useState<BodyView>("front");
  const [activeId, setActiveId] = useState("chest");
  const [activePartId, setActivePartId] = useState(PARTS_BY_MUSCLE.chest?.[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [imageReady, setImageReady] = useState<Record<BodyView, boolean>>({ front: false, back: false });

  const activeMuscle = MUSCLES.find((muscle) => muscle.id === activeId) ?? MUSCLES[0];
  const activeParts = PARTS_BY_MUSCLE[activeMuscle.id] ?? [];
  const activePart = activeParts.find((part) => part.id === activePartId) ?? activeParts[0];
  const visibleMuscles = MUSCLES.filter((muscle) => muscle.view === bodyView);
  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return visibleMuscles;
    return MUSCLES.filter((muscle) => {
      const partTerms = (PARTS_BY_MUSCLE[muscle.id] ?? []).map((part) => `${part.name} ${part.english}`).join(" ");
      return `${muscle.name} ${muscle.english} ${muscle.region} ${partTerms}`.toLowerCase().includes(keyword);
    });
  }, [query, visibleMuscles]);

  const selectMuscle = (muscle: Muscle) => {
    setActiveId(muscle.id);
    setActivePartId(PARTS_BY_MUSCLE[muscle.id]?.[0]?.id ?? "");
    setBodyView(muscle.view);
  };

  const changeView = (nextView: BodyView) => {
    const nextMuscleId = VIEW_DEFAULTS[nextView];
    setBodyView(nextView);
    setActiveId(nextMuscleId);
    setActivePartId(PARTS_BY_MUSCLE[nextMuscleId]?.[0]?.id ?? "");
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
          <p>从结构出发，理解动作。先定位大肌群，再深入肌束与肌头，分别掌握它们的功能、训练偏向和恢复策略。</p>
          <div className="intro-stat">
            <div><strong>{MUSCLES.length}</strong><span>大肌群</span></div>
            <i>+</i>
            <div><strong>{PART_COUNT}</strong><span>精细结构</span></div>
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
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索肌群、肌束或肌头" aria-label="搜索肌群或精细结构" />
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
                  {(PARTS_BY_MUSCLE[muscle.id]?.length ?? 0) > 0 && <em>{PARTS_BY_MUSCLE[muscle.id]?.length} 细分</em>}
                </button>
              ))}
              {searchResults.length === 0 && <p className="empty-state">暂未找到，试试“长头”“中束”或英文名称。</p>}
            </div>
          </div>
          <p className="image-credit">解剖图：CFCF / Wikimedia Commons，<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p>
        </div>

        <aside className="detail-panel" aria-live="polite">
          <div className="detail-head">
            <div>
              <span className="detail-index">{(MUSCLES.findIndex((item) => item.id === activeMuscle.id) + 1).toString().padStart(2, "0")}</span>
              <span className="region-pill">{activeMuscle.region} · {activeMuscle.view === "front" ? "正面" : "背面"}</span>
              {activeParts.length > 0 && <span className="part-count-pill">{activeParts.length} 个细分</span>}
            </div>
            <p>当前肌群</p>
          </div>

          <div className="muscle-title">
            <h2>{activeMuscle.name}</h2>
            <p>{activeMuscle.english}</p>
          </div>
          <p className="muscle-summary">{activeMuscle.summary}</p>

          <section className="part-explorer" aria-label={`${activeMuscle.name}精细结构`}>
            <div className="part-explorer-head">
              <div><span>精细结构</span><h3>选择肌束 / 肌头</h3></div>
              <small>{activeParts.length > 0 ? `${activeParts.length.toString().padStart(2, "0")} PARTS` : "WHOLE MUSCLE"}</small>
            </div>
            {activeParts.length > 0 ? (
              <>
                <div className="part-tabs" role="tablist" aria-label="选择精细结构">
                  {activeParts.map((part) => (
                    <button
                      key={part.id}
                      role="tab"
                      aria-selected={activePart?.id === part.id}
                      className={activePart?.id === part.id ? "active" : ""}
                      onClick={() => setActivePartId(part.id)}
                    >
                      <span>{part.name}</span><small>{part.english}</small>
                    </button>
                  ))}
                </div>
                {activePart && (
                  <article className="part-card" role="tabpanel" key={activePart.id}>
                    <div className="part-card-title">
                      <div><span>当前结构</span><h3>{activePart.name}</h3></div>
                      <em>{activePart.english}</em>
                    </div>
                    <p className="part-location">{activePart.location}</p>
                    <div className="part-details">
                      <section>
                        <span>主要作用</span>
                        <p>{activePart.role}</p>
                      </section>
                      <section>
                        <span>训练偏向</span>
                        <div className="focus-tags">{activePart.training.map((item) => <b key={item}>{item}</b>)}</div>
                      </section>
                      <section>
                        <span>放松提示</span>
                        <p>{activePart.release}</p>
                      </section>
                    </div>
                  </article>
                )}
              </>
            ) : (
              <div className="whole-muscle-note"><span>单一结构</span><p>{activeMuscle.name}在常规训练解剖中通常作为整体理解，不再人为拆分不存在的“肌头”。</p></div>
            )}
          </section>

          <section className="detail-section">
            <div className="section-label"><span>01</span><h3>整体如何工作</h3></div>
            <ul className="function-list">
              {activeMuscle.functions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="detail-section">
            <div className="section-label"><span>02</span><h3>肌群训练</h3><small>动作 · 处方 · 要点</small></div>
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
            <div className="section-label"><span>03</span><h3>整体放松</h3><small>慢一点，以舒适为准</small></div>
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
            <article><b>02</b><div><h3>深入结构</h3><p>切换肌束或肌头，理解不同纤维的位置、作用与训练偏向。</p></div></article>
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
