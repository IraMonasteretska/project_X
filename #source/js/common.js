$(document).ready(function () {
    // Slider
    $('.roadmap-slider').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplaySpeed: 2000,
        infinite: true,
        centerMode: true,
        focusOnSelect: true,
        initialSlide: 2,
        nextArrow: '<button type="button" class="slick-next"></button>',
        prevArrow: '<button type="button" class="slick-prev"></button>',
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    adaptiveHeight: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 3,
                }
            },
        ]
    });

    // header language
    if ($(window).width() > 991) {
        $('.header__language > span').click(function () {
            $(this).next('ul').slideToggle();
        });

        $(document).click(function (event) {
            let $target = $(event.target);
            if (!$target.closest('.header__language > span').length && !$target.closest('.header__language ul').length) {
                $('.header__language ul').slideUp();
            }
        });
    }
    if ($(window).width() <= 991) {
        $('.header__language > span').click(function () {
            $(this).next('ul').toggle();
        });

        $(document).click(function (event) {
            let $target = $(event.target);
            if (!$target.closest('.header__language > span').length && !$target.closest('.header__language ul').length) {
                $('.header__language ul').hide();
            }
        });
    }



    $('.burgermenu-btn').click(function () {
        $('.wrappermenu').addClass('show');
    })
    $('.closemenu').click(function () {
        $('.wrappermenu').removeClass('show');
    });


    $('.submenu > a').click(function (e) {
        e.preventDefault();
        $('.submenu ul').not($(this).next('ul')).slideUp();
        $(this).next('ul').slideToggle();

    });


    $(document).click(function (event) {
        let $target = $(event.target);
        if (!$target.closest('.submenu').length && !$target.closest('.header__language ul').length) {
            $('.submenu ul').slideUp();
        }
    });


});