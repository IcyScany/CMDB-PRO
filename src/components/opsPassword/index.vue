<script setup>
import { computed, toRefs, watch, ref } from 'vue';

const props = defineProps({
    value: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:value', 'validityChange']);
const { value, username } = toRefs(props);

const valueRef = computed({
    get: () => value.value,
    set: (val) => emit('update:value', val)
});

const rules = ref({
    lengthOk: false,
    complexityOk: false,
    similarityOk: true,
    forbiddenOk: true
});

const hasLower = (s) => /[a-z]/.test(s);
const hasUpper = (s) => /[A-Z]/.test(s);
const hasNumber = (s) => /\d/.test(s);
const hasSpecial = (s) => /[^a-zA-Z0-9]/.test(s);

// 计算相似度
function calcSimilarity(a, b) {
    if (!a || !b) return 0;
    const A = a.toLowerCase();
    const B = b.toLowerCase();
    if (!A || !B) return 0;
    // 简单重叠相似度：最长公共子串长度 / 最大长度
    const m = A.length;
    const n = B.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    let maxLen = 0;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (A[i - 1] === B[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLen) maxLen = dp[i][j];
            }
        }
    }
    return maxLen / Math.max(m, n);
}

// 判断是否为键盘连续
const isKeyboardSequence = (pwd) => {
    if (!pwd) return false;
    
    const layouts = [
        "1234567890",
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm",
        "1qaz", "2wsx", "3edc", "4rfv", "5tgb", "6yhn", "7ujm", "8ik,", "9ol.", "0p;/",
        "-pl,", "0okm", "9ijn", "8uhb", "7ygv", "6tfc", "5rdx", "4esz", "3wa"
    ];

    const lower = pwd.toLowerCase();

    for (const line of layouts) {
        // 连续正序
        for (let i = 0; i < line.length - 2; i++) {
            const seq = line.substring(i, i + 3);
            if (lower.includes(seq)) return true;
            if (lower.includes([...seq].reverse().join(""))) return true; // 反序
        }
    }

    return false;
};

// 判断是否有连续数字
const isTrivialNumberSeq = (pwd) => {
    if (!pwd) return false;
    // 纯数字且为常见序列，如123456、000000、112233
    if (/^\d+$/.test(pwd)) {
        if (/^(\d)\1{5,}$/.test(pwd)) return true; // 同一数字重复6位及以上
        if ('0123456789'.includes(pwd) || '9876543210'.includes(pwd)) return true; // 顺序或逆序数字串
        // 长度大于等于6的等差递增或递减数字序列，步长为1
        const digits = pwd.split('').map(Number);
        let asc = true, desc = true;
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] !== digits[i - 1] + 1) asc = false;
            if (digits[i] !== digits[i - 1] - 1) desc = false;
        }
        if (digits.length >= 6 && (asc || desc)) return true;
    }
    return false;
};

const validate = () => {
    const pwd = valueRef.value || '';
    const lengthOk = pwd.length >= 8; // 必须大于等于8位
    const categories = [hasLower(pwd) || hasUpper(pwd), hasNumber(pwd), hasSpecial(pwd)];
    const complexityOk = categories.filter(Boolean).length >= 2;
    const similarity = calcSimilarity(pwd, username.value || '');
    const similarityOk = similarity < 0.7; // 相似度不能高
    const forbiddenOk = !(isTrivialNumberSeq(pwd) || isKeyboardSequence(pwd));
    rules.value = { lengthOk, complexityOk, similarityOk, forbiddenOk };
    emit('validityChange', rules.value);
};

// 密码强度计算
const strengthLevel = computed(() => {
    const pwd = valueRef.value || '';
    if (!pwd) return 0;
    if (!rules.value.lengthOk || !rules.value.complexityOk || !rules.value.similarityOk || !rules.value.forbiddenOk) return 0;
    
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    
    const categoryCount = [hasLower(pwd) || hasUpper(pwd), hasNumber(pwd), hasSpecial(pwd)].filter(Boolean).length;
    if (categoryCount >= 2) score += 1;
    if (categoryCount >= 3) score += 1;
    
    return Math.min(score, 5);
});

const strengthText = computed(() => {
    const level = strengthLevel.value;
    if (level === 0) return '弱';
    if (level <= 2) return '中';
    if (level <= 4) return '强';
    return '很强';
});

const strengthColor = computed(() => {
    const level = strengthLevel.value;
    if (level === 0) return '#ff4d4f';
    if (level <= 2) return '#faad14';
    if (level <= 4) return '#52c41a';
    return '#1890ff';
});

// 生成强密码
const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // 确保至少包含每种字符类型
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // 填充剩余长度到12位
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // 打乱字符顺序
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

const suggestedPassword = ref(generateStrongPassword());

// 定期刷新建议密码，每10秒刷新一次
setInterval(() => {
    suggestedPassword.value = generateStrongPassword();
}, 20000);

watch([valueRef, username], validate, { immediate: true });
</script>

<template>
    <a-popover trigger="click" placement="topLeft">
        <template #content>
            <div class="tips">
                <div class="tip-item">
                    <span :class="rules.lengthOk ? 'icon-ok' : 'icon-err'">{{ rules.lengthOk ? '✓' : '✗' }}</span>
                    <span class="tip-text">密码长度需大于等于8位</span>
                </div>
                <div class="tip-item">
                    <span :class="rules.complexityOk ? 'icon-ok' : 'icon-err'">{{ rules.complexityOk ? '✓' : '✗' }}</span>
                    <span class="tip-text">密码组成必须包含字母，大小写，数字，特殊字符中至少2项组成</span>
                </div>
                <div class="tip-item">
                    <span :class="value && rules.similarityOk ? 'icon-ok' : 'icon-err'">{{ value && rules.similarityOk ? '✓' : '✗' }}</span>
                    <span class="tip-text">不能与账号相似</span>
                </div>
                <div class="tip-item">
                    <span :class="value && rules.forbiddenOk ? 'icon-ok' : 'icon-err'">{{ value && rules.forbiddenOk ? '✓' : '✗' }}</span>
                    <span class="tip-text">禁止使用纯数字或键盘连续密码</span>
                </div>
            </div>
        </template>

        <div>
            <a-input-password
                v-model:value="valueRef"
                :disabled="props.disabled"
                :placeholder="props.placeholder"
                autocomplete="new-password"
            />
        </div>
    </a-popover>

    <div class="strength-bar">
        <span class="strength-text">密码强度：<span :style="{ color: strengthColor }">{{ strengthText }}</span></span>
        <div class="strength-progress">
            <div class="progress-bg">
                <div class="progress-fill" :style="{ width: (strengthLevel / 5) * 100 + '%', backgroundColor: strengthColor }"></div>
            </div>
        </div>

        <div class="password-suggestion">
            <span class="suggestion-text">建议密码：</span>
            <a-typography-paragraph :copyable="{ tooltip: false }">
                <span class="suggested-password-text">{{ suggestedPassword }}</span>
              </a-typography-paragraph>
        </div>
    </div>
    
</template>

<style scoped lang="less">
:deep(.ant-typography) {
    margin: 0 !important;
    font-size: 12px;
}

.tips {
    margin-top: 6px;
    font-size: 12px;
    line-height: 18px;
}
.tip-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 2px;
}
.icon-ok, .icon-err {
    font-weight: bold;
    margin-right: 6px;
    flex-shrink: 0;
    margin-top: 1px;
}
.icon-ok {
    color: #52c41a;
}
.icon-err {
    color: #ff4d4f;
}
.tip-text {
    color: #666;
    line-height: 16px;
}
.strength-bar {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
}
.strength-text {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
}
.strength-progress {
    min-width: 0;
    margin-right: 16px;
}
.progress-bg {
    width: 120px;
    height: 4px;
    background-color: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 2px;
}
.ok { color: #52c41a; }
.err { color: #ff4d4f; }

.password-suggestion {
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
}
.suggestion-icon {
    font-size: 14px;
}
.suggestion-text {
    color: #666;
}
.suggested-password-text {
    font-family: 'Courier New', monospace;
    font-weight: 500;
    background-color: white;
    user-select: all;
}
</style>
