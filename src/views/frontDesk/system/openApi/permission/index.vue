<script setup>
import API from "@/api/system/openapi";
import { message } from "ant-design-vue";

const state = reactive({
    userList: [],
    routeList: [],
    loading: false
});

const checkState = reactive({
    user: null,
    all: false,
    menus: [],
    routes: []
});

onMounted(async () => {
    state.loading = true;

    await getUserList();
    await getRouteList();

    state.loading = false;
});

// 获取用户列表
const getUserList = async() => {
    await API.getUserList().then(res => {
        state.userList = res;
    });
};

// 获取路由列表
const getRouteList = async() => {
    await API.getRouteList().then(res => {
        state.routeList = res;
    });
};

// 用户选择
const handleUserChange = async () => {
    state.loading = true;

    try {
        const res = await API.getUserPermission(checkState.user);
        checkState.menus = [];
        checkState.routes = res;
        state.loading = false;
    }
    catch (error) {
        state.loading = false;
    }
};

// 授权
const handleSubmit = async () => {
    state.loading = true;

    try {
        const res = await API.postUserAuthorize(checkState.user, { route_ids: checkState.routes });

        message.success(res?.message);
        state.loading = false;
    }
    catch (error) {
        state.loading = false;
    }

};

// 全选
const toggleCheckAll = () => {
    if(!checkState.all) {
        checkState.menus = Object.keys(state.routeList);
        checkState.routes = Object.values(state.routeList).flat().map(route => route.id);
    }
    else {
        checkState.menus = [];
        checkState.routes = [];
    }

    checkState.all = !checkState.all;
};

// 勾选菜单
const toggleCheckMenu = (menu) => {
    const index = checkState.menus.indexOf(menu);
    const routes = state.routeList?.[menu];

    if(index !== -1) {
        checkState.menus.splice(index, 1);

        routes.forEach(route => {
            let routeIndex = checkState.routes.indexOf(route.id);
            if(routeIndex !== -1) {
                checkState.routes.splice(routeIndex, 1);
            }
        });
    }

    else {
        checkState.menus.push(menu);

        routes.forEach(route => {
            let routeIndex = checkState.routes.indexOf(route.id);
            if(routeIndex === -1) {
                checkState.routes.push(route.id);
            }
        });
    }
};

// 勾选路由
const toggleCheckRoute = (route) => {
    const index = checkState.routes.indexOf(route.id);
    if(index !== -1) {
        return checkState.routes.splice(index, 1);
    }
    checkState.routes.push(route.id);
};
</script>

<template>
    <!-- User -->
    <a-spin :spinning="state.loading">
        <a-card hoverable class="card-box">
            <template #title>
                <div class="card-title-with-badge">
                    <span>选择用户</span>
                </div>
            </template>
    
            <div>
                <a-radio-group v-model:value="checkState.user" @change="handleUserChange">
                    <a-radio 
                        v-for="item in state.userList" 
                        :key="item.id" 
                        :value="item.id"
                    >
                        {{ item.username }}
                    </a-radio>
                </a-radio-group>
            </div>
        </a-card>
    
        <!-- Route -->
        <a-card hoverable class="card-box">
            <template #title>
                <div class="card-title-with-badge">
                    <span>用户权限</span>
                </div>
            </template>
    
            <vxe-button 
                status="primary" 
                :content="checkState.all ? '取消全选' : '全选'" 
                size="mini"
                class="mb-5"
                @click="toggleCheckAll"
            />
            
            <div v-for="(list, menu) in state.routeList" :key="menu">
                <a-checkbox :checked="checkState.menus.includes(menu)" @click="toggleCheckMenu(menu)">
                    {{ menu }}
                </a-checkbox>
    
                <div class="p-2 pl-10">
                    <template v-for="(route, index) in list" :key="index">
                        <a-checkbox
                            :checked="checkState.routes.includes(route.id)"
                            @click="toggleCheckRoute(route)"
                        >
                            {{ route.description }}({{ route.method }})
                        </a-checkbox>
                    </template>
                </div>
            </div>
        </a-card>
    
        <vxe-button
            :disabled="!checkState.user"
            :loading="state.loading"  
            status="primary" 
            size="default" 
            content="用户权限更新" 
            class="submit-btn" 
            @click="handleSubmit"
        />
    </a-spin>
</template>

<style scoped lang="less">
.card-box {
    border-left: 4px solid var(--primary-color); 
    margin-top: 10px;
}

.submit-btn {
    position: fixed;
    bottom: 8%;
    right: 2%;
}
</style>
