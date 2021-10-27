(() => {
    const base64url = (str) => {
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const hour = d.getHours();
        const minute = d.getMinutes();
        const second = d.getSeconds();
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
    async function initApp() {
        window._comment_rootEl = document.getElementById('comment_thread');
        if (!_comment_rootEl) return false;
        window._comment_var = {
            _host: window._comment_rootEl.dataset.host,
            _siteId: window._comment_rootEl.dataset.siteId,
            _pageId: window._comment_rootEl.dataset.pageId,
            _pageUrl: window._comment_rootEl.dataset.pageUrl,
            _pageTitle: window._comment_rootEl.dataset.pageTitle
        };
        window._comment_rootEl.innerHTML = '';
        try {
            const e = await fetch('/comment_template.html')
            if (e.ok) {
                const html = await e.text();
                window._comment_rootEl.innerHTML = html;
                window._comment_app = PetiteVue.createApp({
                    $delimiters: ['[[', ']]'],
                    store: store,
                }).mount()
            } else {
                throw new Error(`${e.status} - ${e.statusText}`);
            }
        } catch (error) {
            if (!window._comment_rootEl) return false;
            window._comment_rootEl.innerHTML = `<div class="text-center my-10">加载评论模板失败：<b>${err.message}</b></div>`;
            console.log(err);
        }
    }
    initApp();
    window.reloadComment = () => {
        if (window._comment_app) {
            window._comment_app.unmount();
        }
        initApp();
    }

    const store = PetiteVue.reactive({
        loading: true,
        data: {},
        loadingText: '加载评论中···',
        handleLoading(val) {
            this.loading = val;
        },
        async updateData() {
            try {
                const e = await fetch(`${window._comment_var._host}/comment/${window._comment_var._siteId}/${base64url(window._comment_var._pageId)}`);
                const json = await e.json();
                this.loadingText = '';
                this.data = json.data;
                if (!this.data.comment.length) {
                    this.loadingText = '暂无评论';
                }
            } catch (error) {
                if (!window._comment_rootEl) return false;
                window._comment_rootEl.innerHTML = `<div class="text-center my-10">初始化评论失败: ${error.message}</div>`;
                console.log(error);
            }
        }
    })

    window.commentForm = function (props) {
        return {
            $template: '#comment-form-template',
            $delimiters: ['[[', ']]'],
            form: {
                name: 'hazymoon',
                site: '',
                mail: 'imiku.me@gmail.com',
                content: '',
            },
            anonymous: false,
            data: {},
            owoData: window.owo,
            currentOwo: 0,
            addOwo(item) {
                this.form.content += this.owoData[this.currentOwo].key.replace('$', this.owoData[this.currentOwo].type === 'text' ? item : item.text);
            },
            submit(replyID) {
                if (this.form.content.trim().length < 10) {
                    return alert('评论不少于10个字')
                }
                let data = {
                    content: this.form.content,
                    anonymous: true,
                    page_id: window._comment_var._pageId,
                    page_url: window._comment_var._pageUrl,
                    page_title: window._comment_var._pageTitle,
                    site: window._comment_var._siteId,
                    reply: Boolean(replyID),
                    reply_id: replyID
                }
                if (!this.anonymous) {
                    if (!this.form.name.trim()) {
                        return alert('请填写昵称');
                    }
                    if (!this.form.mail.trim() || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(this.form.mail)) {
                        return alert('请填写正确的邮箱');
                    }
                    data = {
                        user: this.form.name,
                        mail: this.form.mail,
                        content: this.form.content,
                        anonymous: false,
                        page_id: window._comment_var._pageId,
                        page_url: window._comment_var._pageUrl,
                        page_title: window._comment_var._pageTitle,
                        site: window._comment_var._siteId,
                        reply: Boolean(replyID),
                        reply_id: replyID
                    }
                }
                this.store.handleLoading(true);
                fetch(`${window._comment_var._host}/comment/${window._comment_var._siteId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(res => res.json())
                    .then(async e => {
                        if (e.error) {
                            alert(e.error);
                        } else {
                            alert('回复成功！');
                        }
                        await this.store.updateData();
                        this.store.handleLoading(false);
                    }).catch(err => {
                        console.log(err);
                        alert(`评论失败: ${err}`);
                        this.store.handleLoading(false);
                    })
            },
            mounted() {
                if (props) {
                    this.data = props;
                }
            },
        }
    }

    window.initComment = function () {
        return {
            $delimiters: ['[[', ']]'],
            data: {
                comment: [],
            },
            async mounted() {
                this.store.handleLoading(true);
                await this.store.updateData();
                this.store.handleLoading(false);
            },
        }
    }

    window.RenderComment = function (key) {
        return {
            $template: '#comment-template',
            $delimiters: ['[[', ']]'],
            key,
            reply: false,
            formatDate,
            getData() {
                let data;
                this.key.split('-').forEach((key, index) => {
                    key = parseInt(key);
                    if (index === 0) {
                        data = this.store.data.comment[key];
                    } else {
                        data = data.Children[key];
                    }
                })
                return data;
            }
        }
    }

    function createOwoStyle() {
        const chunk = (arr, n) => {
            const result = [];
            for (let i = 0; i < arr.length; i += n) {
                result.push(arr.slice(i, i + n));
            }
            return result;
        };

        const style = document.createElement('style');
        let css = `
        .owoico {
            background-repeat: no-repeat;
            display: inline-block;
            max-width: 100%;
            vertical-align: bottom;
        }
        .owopaopao {
            background-image: url('/images/owopaopao.png');
            width: 30Px;
            height: 30Px;
        }
        `;
        window.owo = [];
        owo[0] = {
            name: '颜文字',
            "type": "text",
            "key": "$",
            "container": ["|´・ω・)ノ", "ヾ(≧∇≦*)ゝ", "(☆ω☆)", "（╯‵□′）╯︵┴─┴", "￣﹃￣", "(*/ω＼*)", "∠( ᐛ 」∠)＿", "(๑•̀ㅁ•́ฅ)", "→_→", "୧(๑•̀⌄•́๑)૭", "٩(ˊᗜˋ*)و", "(ノ°ο°)ノ", "(´இ皿இ｀)", "⌇●﹏●⌇", "(ฅ´ω`ฅ)", "(╯°A°)╯︵○○○", "φ(￣∇￣o)", "ヾ(´･ ･｀｡)ノ\"", "( ง ᵒ̌皿ᵒ̌)ง⁼³₌₃", "(ó﹏ò｡)", "Σ(っ °Д °;)っ", "( ,,´･ω･)ﾉ\"(´っω･｀｡)", "╮(╯▽╰)╭ ", "o(*////▽////*)q ", "＞﹏＜", "( ๑´•ω•) \"(ㆆᴗㆆ)", "(｡•ˇ‸ˇ•｡)", "(๑•̀ω•́๑)", "(๑•́ ₃ •̀๑)", "(灬°ω°灬)", "(*^ω^*)", "✧*。٩(ˊωˋ*)و✧*。", "(￣y▽￣)~*捂嘴偷笑", "(o`•ω•)ノ(ノД`)", "(⌒▽⌒)", "（￣▽￣）", "(=・ω・=)", "(｀・ω・´)", "(〜￣△￣)〜", "(･∀･)", "(°∀°)ﾉ", "(￣3￣)", "╮(￣▽￣)╭", "( ´_ゝ｀)", "←_←", "→_→", "(<_<)", "(>_>)", "(;¬_¬)", "(\"▔□▔)", "(ﾟДﾟ≡ﾟдﾟ)!?", "Σ(ﾟдﾟ;)", "Σ( ￣□￣||)", "(´；ω；`)", "（/TДT)/", "(^・ω・^ )", "(｡･ω･｡)", "(●￣(ｴ)￣●)", "ε=ε=(ノ≧∇≦)ノ", "(´･_･`)", "(-_-#)", "（￣へ￣）", "(￣ε(#￣) Σ", "ヽ(`Д´)ﾉ", "(╯°口°)╯(┴—┴", "（#-_-)┯━┯", "_(:3」∠)_", "_(•̀ω•́ 」∠)_", "─=≡Σ((( つ•̀ω•́)つ", "(ಥ_ಥ)", "(๑•̀ㅂ•́)و✧", "(๑╹∀╹๑)", "눈_눈", "ᕦ(ò_óˇ)ᕤ", "(๑•ั็ω•็ั๑)", "( *・ω・)✄╰ひ╯", "~(￣▽￣)C❀(捏菊花)", "(((┏(;￣▽￣)┛装完逼就跑"]
        }
        owo[1] = {
            name: "泡泡",
            "type": "image",
            "key": "@[$]",
            container: []
        }
        const paopaoText = ["呵呵", "高兴", "吐舌", "惊讶", "酷", "生气", "抛媚眼", "流汗", "大哭", "吨吨吨", "无语", "鄙视", "不高兴", "真棒", "满眼是钱", "疑问", "阴险", "吐", "疑", "笑喷", "害羞", "亲", "懵逼", "激动", "呵", "握拳", "滑稽", "咧嘴笑", "大汗", "满脸不安", "好奇", "睡觉", "流泪", "愤怒", "哦", "喷", "爱心", "心碎", "鲜花", "手握炸药", "礼物", "彩虹", "月亮", "太阳", "钱", "灯泡", "咖啡", "蛋糕", "音乐", "黑脸", "六", "剪刀手", "棒", "下", "OK", "滑稽02", "腼腆", "捂嘴", "猥琐笑", "惊讶吓", "酸爽", "啊", "笑出泪", "抠鼻", "犀利", "呆", "傲娇", "沙发", "流汗滑稽", "纸巾", "香蕉", "便便", "药丸", "红领巾", "蜡烛", "三道杠", "乖巧", "黑脸笑", "被打滑稽", "举手", "指两边", "自己体会", "吃瓜", "托腮", "无奈", "dog脸", "暗中观察", "暗中观察dog", "cos滑稽", "滑稽右", "斗鸡眼滑稽", "滑稽小嘴", "滑稽大佬"];
        chunk(Array(93).fill(1).map((_, i) => i + 1), 10).forEach((_, i) => {
            _.forEach((_, ii) => {
                const n = _.toString().padStart(2, '0')
                css += `.owo-t-${n} {
                    background-position: -${5 + ii * 40}px -${5 + i * 40}px
                }
                `
                owo[1].container.push({
                    text: paopaoText[_-1],
                    icon: `<span class=\"owoico owopaopao owo-t-${n}\"></span>`
                })
            })
        });
        style.innerHTML = css;
        document.body.appendChild(style);
    }
    createOwoStyle();
})()