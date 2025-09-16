/**
 * 模块用于子页面打开
 * **/

const subPage = () => {
    /** 子页面打开
     *  @param
        row：子页面的行数据
     * */
    const subPageOpen = ref(false); // 子页面是否显示
    const subPageRow = ref(null); // 子页面的行数据

    const handleSubPageOpen = (row) => {
        subPageOpen.value = true;
        subPageRow.value = row;
    };
    
    return {
        subPageOpen,
        subPageRow,
        handleSubPageOpen,
    };
};

export default subPage;
