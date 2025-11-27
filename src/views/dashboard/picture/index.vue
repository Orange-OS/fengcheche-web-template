<template>
  <div class="container">
    <div class="header">
      <!-- 左边 -->
      <div class="header-left">
        <div class="header-left-title">
          图片模块
        </div>
      </div>

      <!-- 中间菜单 -->
      <div class="header-center">
        <div class="menu-container">
          <template v-for="(item, index) in menuList" :key="index">
            <div class="menu-item">
              <span class="menu-label">
                {{ item.label }}
              </span>

              <!-- 如果有子元素，右边加图标 -->
              <span v-if="item.children && item.children.length" class="dropdown-icon">▼</span>

              <!-- 下拉子菜单 -->
              <div v-if="item.children && item.children.length" class="submenu-container">
                <template v-for="(child, cIndex) in item.children" :key="cIndex">
                  <div class="submenu-item">
                    <span class="submenu-label">{{ child.label }}</span>

                    <!-- 递归子级 -->
                    <span v-if="child.children && child.children.length" class="dropdown-icon">▶</span>
                    <div v-if="child.children && child.children.length" class="submenu-container">
                      <template v-for="(sub, sIndex) in child.children" :key="sIndex">
                        <div class="submenu-item">
                          <span class="submenu-label">{{ sub.label }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 右边 -->
      <div class="header-right"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const menuList = [
  {
    "label": "简历修改",
    "type": "C",
  },
  {
    "label": "简历制作",
    "type": "M",
    "children": [
      {
        "label": "在线制作",
        "type": "C"
      }
    ]
  },
]
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;

  .header {
    width: 100%;
    height: 65px;
    background-color: aquamarine;
    display: flex;

    .header-left {
      width: 300px;
      height: 100%;
      background-color: red;

      .header-left-title {
        padding: 15px 0px 10px 20px;
        font-size: 20px;
        color: black;
        font-weight: bold;
      }
    }

    .header-center {
      height: 100%;
      background-color: greenyellow;
      flex-grow: 4;

      .menu-container {
        display: flex;
        gap: 20px;
        align-items: center;
        height: 100%;
        padding: 0 10px;

        .menu-item {
          position: relative;
          cursor: pointer;
          padding: 0 10px;
          height: 100%;
          display: flex;
          align-items: center;

          .menu-label {
            font-size: 16px;
            font-weight: 500;
            color: #333;
          }

          .dropdown-icon {
            margin-left: 5px;
            font-size: 12px;
          }

          /* 下拉子菜单 */
          .submenu-container {
            display: none; /* 默认隐藏 */
            position: absolute;
            top: 100%; /* 显示在下方 */
            left: 0;
            background: #fff;
            border: 1px solid #ddd;
            min-width: 120px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            z-index: 1000;

            .submenu-item {
              padding: 8px 12px;
              white-space: nowrap;

              .submenu-label {
                font-size: 14px;
                color: #555;
              }

              &:hover {
                background-color: #f5f5f5;
              }

              .submenu-container {
                top: 0;
                left: 100%; /* 右侧展开 */
              }
            }
          }

          /* 悬停时展开 */
          &:hover > .submenu-container {
            display: block;
          }
        }
      }
    }

    .header-right {
      height: 100%;
      background-color: black;
      flex-grow: 1;
    }
  }
}
</style>
