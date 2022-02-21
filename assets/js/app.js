const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'BINH_PLAYER';

const audio = $('#audio');
const cd = $('.cd');
const cdWidth = cd.offsetWidth;
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const player = $('.player');
const timerange = $('#progress');
const heading = $('header h2');
const cdthumb = $('.cd-thumb');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,    //Khi chạy ứng dụng lên thì sẽ phát bài hát đầu tiên

    isPlaying: false,

    isRandom: false,

    isRepeat: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs : [
        {
            name: "Bad Liar",
            singer: "Imagine Dragon",
            path: "./assets/music/Bad Liar - Imagine Dragons.mp3",
            image: ""
        },
        {
            name: "Demons",
            singer: "Imagine Dragon",
            path: "./assets/music/Demons - Imagine Dragon.mp3",
            image:
            "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg"
        },
        {
            name: "Peaches",
            singer: "Justin Bieber",
            path:
            "./assets/music/Peaches-JustinBieberDanielCaesarGiveon-6997601.mp3",
            image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg"
        },
        {
            name: "Sun goes down",
            singer: "Lil Nas X",
            path: "./assets/music/SUN GOES DOWN - Lil Nas X (NhacPro.net).mp3",
            image:
            "https://a10.gaanacdn.com/images/song/39/24225939/crop_480x480_1536749130.jpg"
        },
        {
            name: "Titanium",
            singer: "Sia",
            path: "./assets/music/Titanium-DavidGuettaSia-3293909.mp3",
            image:
            "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg"
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const html = this.songs.map((song, index) => { //Phần này tương tự như lấy từ API ra
            return  `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}"> 
                        <div class="thumb"
                            style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`
            
            } 
        )
        playlist.innerHTML = html.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {    //Ta định nghĩa thuộc tính cho thằng this(app) có tên là currentSong. Gọi đến thuộc tính này sẽ trả ra như cái get
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function() {
        document.addEventListener('scroll', function() {
            const scroll = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scroll;

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0; //Trường hợp newWidth nhảy về âm thì ảnh sẽ không ẩn hết
            cd.style.opacity = newWidth / cdWidth; //opa chạy từ 0-1, ta lấy tỉ lệ từ kích thước mới và cũ cho ảnh mờ dần
        })

        //Lắng nghe khi click vào btn thì phát nhạc và chuyển nó thành nút pause
        playBtn.addEventListener("click", function() {
            if(app.isPlaying) { //Nhảy lên đây thì nhạc sẽ dừng
                audio.pause();
            }
            else {  //Khi chạy web isPlaying mặc định false, nên click thì nhạc sẽ  chạy
                audio.play();
            }
        })

        //Click vào nút tua sẽ nhảy bài hát
        nextBtn.addEventListener("click", function() {
            if (app.isRandom) {
                app.randomSong();
            }
            else {
                app.nextSong();
            }
            app.render();
            audio.play();
            app.scrollToActiveSong();
        })

        prevBtn.addEventListener("click", function() {
            if (app.isRandom) {
                app.randomSong();
            }
            else {
                app.prevSong();
            }
            app.render();
            audio.play();
            app.scrollToActiveSong();
        })

        //Khi play thì thumb sẽ quay tròn, còn pause sẽ dừng
        const cdThumbAnimation = cdthumb.animate([
            {
                transform: "rotate(360deg)"
            }
        ], 
        {
            duration: 13000,
            iterations: Infinity
        })
        cdThumbAnimation.pause(); //Mặc định mới vào nó không quay

        //Lắng nghe sự kiện audio có đang play hay không
        audio.addEventListener("play", function() { //Nhạc đang chạy nên nó nhảy vào sự kiện này, isPlaying là true, nếu click tiếp thì lại nhảy lên if bên trên
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimation.play(); //khi nhạc chạy thì thumb quay
        })
        audio.addEventListener("pause", function() { //Nhạc dừng thì isPlaying lại đc set thành false
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimation.pause(); //Khi pause nhạc thì thumb cũng pause lại
        })    
        
        //Khi nhạc chạy thì thay đổi thanh tiến trình nhạc
        audio.addEventListener('timeupdate', function(e) {
            if (audio.duration) {
                timerange.value = (audio.currentTime / audio.duration) * 100;//Giá trị thanh bằng thời gian hiện tại bài nhạc chia tổng thời gian
            }
        })

        //Khi click vào 1 điểm thì nhạc thay đổi (chức năng tua)
        timerange.addEventListener('change', function(e) {  //Bắt sự kiện khi có sự thay đổi trên thanh progress
            if (audio.duration) {   
                const seekTime = e.target.value / 100 * audio.duration;
                audio.currentTime = seekTime;
            }
        })

        randomBtn.addEventListener('click', function(e) {
            app.isRandom = !app.isRandom;   //Đổi ngược trạng thái của isRandom, nếu đang false click vào sẽ thành true và ngược lại
            app.setConfig('isRandom', app.isRandom);

            randomBtn.classList.toggle('active', app.isRandom);//Đối số thứ 2 nếu là true thì sẽ add class, còn false sẽ remove đi
        })

        repeatBtn.addEventListener('click', function() {
            app.isRepeat = !app.isRepeat;   //Đổi ngược trạng thái của isRepeat, nếu đang false click vào sẽ thành true và ngược lại
            app.setConfig('isRepeat', app.isRepeat);


            repeatBtn.classList.toggle('active', app.isRepeat);//Đối số thứ 2 nếu là true thì sẽ add class, còn false sẽ remove đi
        })

        //Khi chạy hết bài hát thì sẽ lặp lại nếu isRepeat = true
        audio.addEventListener('ended', function(){
            if(!app.isRepeat) { //Nếu không bật lặp, tức isRepeat = false thì sẽ next như thường rồi tự play
                if (app.isRandom) {
                    app.randomSong();
                }
                else {
                    app.nextSong();
                }   
            }
            audio.play();
        })

        //Lắng nghe khi click vào những thẻ con của playlist
        playlist.addEventListener('click', function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                //Click vào thằng song đang đc active thì sẽ không chuyển bài và click vào option vẫn nhận
                if(songNode || !e.target.closest('.option')) { //Xử lý khi click bài song
                    app.currentIndex = Number(songNode.getAttribute('data-index'));
                    app.loadCurrentSong();
                    app.render();
                    audio.play();
                }  

                //Xử lý khi click vào option
                if (e.target.closest('.option')) {

                }
                    
            }
        })

    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdthumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++;

        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;

        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length-1;
        }

        this.loadCurrentSong();
    },

    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while (this.currentIndex === newIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView(
                {
                    behavior: "smooth",
                    block: 'center'
                }
            )
        },1000)
    },

    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa thuộc tính cho Object
        this.defineProperties();

        //Lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvent();

        //Load bài hát khi chạy app
        this.loadCurrentSong();

        //Render playlist
        this.render();

        //Hiển thị trạng thái ban đầu của btn repeat và random
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);
    }
}

app.start();

