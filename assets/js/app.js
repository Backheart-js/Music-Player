const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const audio = $('#audio');
const cd = $('.cd');
const cdWidth = cd.offsetWidth;
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const player = $('.player');
const timerange = $('#progress');
const heading = $('header h2');
const cdthumb = $('.cd-thumb');


const app = {
    currentIndex: 0,    //Khi chạy ứng dụng lên thì sẽ phát bài hát đầu tiên

    isPlaying: false,

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

    render: function() {
        const html = this.songs.map((song) => { //Phần này tương tự như lấy từ API ra
            return  `<div class="song">
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
        $('.playlist').innerHTML = html.join('');
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
            app.nextSong();
            audio.play();
        })

        prevBtn.addEventListener("click", function() {
            app.prevSong();
            audio.play();
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
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdthumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

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
        console.log(this.currentIndex);

        this.loadCurrentSong();
    },

    start: function() {
        //Định nghĩa thuộc tính cho Object
        this.defineProperties();

        //Lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvent();

        //Load bài hát khi chạy app
        this.loadCurrentSong();

        //Render playlist
        this.render();
    }
}

app.start();
