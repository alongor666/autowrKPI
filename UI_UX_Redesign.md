# UI/UX 重构设计文档：2x2 分析模式与筛选器优化

## 1. 设计原则 (Design Principles)
- **文档即代码 (Documentation as Code)**: 本文档作为 UI/UX 结构的单一事实来源 (SSOT)。
- **结构化组织 (Structured Organization)**: 按界面层级组织文档。
- **关联优先 (Association First)**: 筛选器按业务关联度分组排列。

## 2. 分析模式 (Analysis Modes)
引入 2x2 矩阵切换控制，位于页面顶部或筛选栏上方。

| 模式维度 | 选项 A (Default) | 选项 B | 交互行为差异 |
| :--- | :--- | :--- | :--- |
| **组织模式 (Org Mode)** | **多机构 (Multi)** | **单机构 (Single)** | **多机构**: 机构筛选器支持多选，图表展示排名/对比。<br>**单机构**: 机构筛选器仅支持单选，图表聚焦单一机构详情。 |
| **区间模式 (Interval Mode)** | **单周 (Single)** | **多周 (Multi)** | **单周**: 年份、周次筛选器仅支持单选 (Radio)。<br>**多周**: 年份、周次筛选器支持多选 (Checkbox)。 |

## 3. 筛选器架构 (Filter Architecture)

### 3.1 筛选器组件化
所有筛选维度（包括时间）统一使用 **下拉选择器 (Drill Selector)** 组件，保持交互一致性。

### 3.2 排序与分组 (Sorting & Grouping)
筛选器栏位从左至右排序如下：

#### **Group 1: 核心组织 (Core Organization)**
1.  **三级机构 (`third_level_organization`)**
    *   *优先级*: 最高 (Rank 1)
    *   *行为*: 受组织模式控制 (单选/多选)。

#### **Group 2: 时间维度 (Time Dimension)**
2.  **保单年度 (`policy_start_year`)**
    *   *行为*: 受区间模式控制。
3.  **周次 (`week_number`)**
    *   *行为*: 受区间模式控制。

#### **Group 3: 业务核心 (Business Core)**
4.  **险种 (`insurance_type`)** *(New)*
5.  **业务类型 (`ui_short_label`)**
6.  **险别组合 (`coverage_type`)**

#### **Group 4: 车辆属性 (Vehicle Attributes)**
7.  **新能源 (`is_new_energy_vehicle`)** *(原 energy_type)*
8.  **是否过户 (`is_transferred_vehicle`)**
9.  **续保状态 (`renewal_status`)**
10. **车险分等级 (`vehicle_insurance_grade`)** *(Always Visible)*
11. **小货车评分 (`small_truck_score`)** *(Always Visible)*
12. **大货车评分 (`large_truck_score`)** *(Always Visible)*

#### **Group 5: 渠道 (Channel)**
13. **终端来源 (`terminal_source`)**

### 3.3 交互逻辑更新
- **全量显示**: 移除对车险分/货车评分的动态隐藏逻辑，改为始终显示。
- **级联锁定**: 保持现有的“非营客-新”锁定续保状态等逻辑。
- **模式联动**:
    - 切换到“单周模式”时，若当前已选多个周次，自动保留最近的一个。
    - 切换到“单机构模式”时，若当前已选多个机构，自动保留第一个或重置。

## 4. 数据层变更 (Data Layer Changes)
- **Worker**: 提取 `insurance_type` 维度值。
- **Worker**: 提取 `week_number` 和 `policy_start_year` 作为通用维度供筛选器使用。
