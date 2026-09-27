(function() {
    'use strict';

    var demoUrls = [
        'https://www.instagram.com/ford/reel/DZ7nrziALx6/?hl=en',
        'https://www.instagram.com/fordtrucks/p/DZ3fT3oFfW6/',
        'https://www.instagram.com/zacbrownband/reel/DZvdHTlyqY-/',
        'https://www.instagram.com/fordmustang/p/DZuuMLdkc3a/',
        'https://www.instagram.com/ford/reel/DZtLcbkAXcg/?hl=en',
        'https://www.instagram.com/fordmustang/p/DZgNWPmDw5r/'
    ];

    function byId(id) {
        return document.getElementById(id);
    }

    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function parseInstagramLine(line, defaultType) {
        var raw = String(line || '').trim();

        if (!raw) {
            return null;
        }

        raw = raw.replace(/[<>]/g, '');

        var embedMatch = raw.match(/data-instgrm-permalink=["']([^"']+)["']/i);

        if (embedMatch && embedMatch[1]) {
            raw = embedMatch[1];
        }

        var prefixMatch = raw.match(/^(p|post|reel)\s*:\s*([A-Za-z0-9_-]+)/i);

        if (prefixMatch) {
            return {
                type: prefixMatch[1].toLowerCase() === 'reel' ? 'reel' : 'p',
                id: prefixMatch[2]
            };
        }

        var urlMatch = raw.match(/instagram\.com\/(?:[^\/\s?#]+\/)?(p|reel)\/([^\/\s?#]+)/i);

        if (urlMatch) {
            return {
                type: urlMatch[1].toLowerCase(),
                id: urlMatch[2]
            };
        }

        var pathMatch = raw.match(/(?:^|\/)(p|reel)\/([A-Za-z0-9_-]+)/i);

        if (pathMatch) {
            return {
                type: pathMatch[1].toLowerCase(),
                id: pathMatch[2]
            };
        }

        var idMatch = raw.match(/^([A-Za-z0-9_-]{5,})$/);

        if (idMatch) {
            return {
                type: defaultType === 'reel' ? 'reel' : 'p',
                id: idMatch[1]
            };
        }

        return null;
    }

    function parseInstagramItems(input, defaultType) {
        var lines = String(input || '').split(/\r?\n/);
        var items = [];
        var errors = [];
        var seen = {};

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (!line) {
                continue;
            }

            var item = parseInstagramLine(line, defaultType);

            if (!item || !item.id) {
                errors.push('Line ' + (i + 1) + ' could not be read: ' + line);
                continue;
            }

            var key = item.type + ':' + item.id;

            if (!seen[key]) {
                seen[key] = true;
                items.push(item);
            }
        }

        return {
            items: items,
            errors: errors
        };
    }

    function buildSlides(items) {
        var slideLines = [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var cleanType = item.type === 'reel' ? 'reel' : 'p';
            var cleanId = item.id;
            var url = 'https://www.instagram.com/' + cleanType + '/' + cleanId + '/';
            var label = cleanType === 'reel' ? 'View this reel on Instagram' : 'View this post on Instagram';

            slideLines.push('            <div class="instagram-slide">');
            slideLines.push('                <blockquote class="instagram-media" data-instgrm-permalink="' + escapeAttr(url) + '" data-instgrm-version="14">');
            slideLines.push('                    <a href="' + escapeAttr(url) + '" target="_blank" rel="noopener">' + label + '</a>');
            slideLines.push('                </blockquote>');
            slideLines.push('            </div>');

            if (i !== items.length - 1) {
                slideLines.push('');
            }
        }

        return slideLines.join('\n');
    }

    function buildCarouselCode(items) {
        var lines = [];

        lines.push('<style>');
        lines.push('.instagram-carousel-wrap {');
        lines.push('    position: relative;');
        lines.push('    max-width: 1200px;');
        lines.push('    margin: 0 auto;');
        lines.push('    padding: 0 55px;');
        lines.push('    overflow: hidden;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-track {');
        lines.push('    display: flex;');
        lines.push('    gap: 20px;');
        lines.push('    align-items: flex-start;');
        lines.push('    overflow-x: auto;');
        lines.push('    overflow-y: hidden;');
        lines.push('    scroll-snap-type: x mandatory;');
        lines.push('    scroll-behavior: smooth;');
        lines.push('    -webkit-overflow-scrolling: touch;');
        lines.push('    overscroll-behavior-x: contain;');
        lines.push('    overflow-anchor: none;');
        lines.push('    margin: 0 auto;');
        lines.push('    padding: 0 2px 20px;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-track::-webkit-scrollbar {');
        lines.push('    display: none;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-track {');
        lines.push('    -ms-overflow-style: none;');
        lines.push('    scrollbar-width: none;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-slide {');
        lines.push('    flex: 0 0 calc((100% - 40px) / 3);');
        lines.push('    max-width: calc((100% - 40px) / 3);');
        lines.push('    min-width: 0;');
        lines.push('    box-sizing: border-box;');
        lines.push('    scroll-snap-align: start;');
        lines.push('    scroll-snap-stop: always;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-slide .instagram-media {');
        lines.push('    margin: 0 auto !important;');
        lines.push('    min-width: 0 !important;');
        lines.push('    max-width: 540px !important;');
        lines.push('    width: 100% !important;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-slide iframe {');
        lines.push('    max-width: 100% !important;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-arrow {');
        lines.push('    position: absolute;');
        lines.push('    top: 50%;');
        lines.push('    z-index: 20;');
        lines.push('    width: 44px;');
        lines.push('    height: 44px;');
        lines.push('    padding: 0;');
        lines.push('    border: 0;');
        lines.push('    border-radius: 50%;');
        lines.push('    background: #1f2937;');
        lines.push('    color: #fff;');
        lines.push('    font-size: 28px;');
        lines.push('    line-height: 44px;');
        lines.push('    text-align: center;');
        lines.push('    transform: translateY(-50%);');
        lines.push('    cursor: pointer;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-prev {');
        lines.push('    left: 0;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-next {');
        lines.push('    right: 0;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-arrow:hover,');
        lines.push('.instagram-carousel-arrow:focus {');
        lines.push('    background: #374151;');
        lines.push('    color: #fff;');
        lines.push('    outline: 2px solid #2563eb;');
        lines.push('    outline-offset: 2px;');
        lines.push('}');
        lines.push('');
        lines.push('.instagram-carousel-arrow:disabled {');
        lines.push('    opacity: 0.35;');
        lines.push('    cursor: not-allowed;');
        lines.push('}');
        lines.push('');
        lines.push('@media (max-width: 991px) {');
        lines.push('    .instagram-slide {');
        lines.push('        flex: 0 0 calc((100% - 20px) / 2);');
        lines.push('        max-width: calc((100% - 20px) / 2);');
        lines.push('    }');
        lines.push('}');
        lines.push('');
        lines.push('@media (max-width: 767px) {');
        lines.push('    .instagram-carousel-wrap {');
        lines.push('        padding: 0 42px;');
        lines.push('    }');
        lines.push('');
        lines.push('    .instagram-carousel-track {');
        lines.push('        gap: 20px;');
        lines.push('    }');
        lines.push('');
        lines.push('    .instagram-slide {');
        lines.push('        flex: 0 0 100%;');
        lines.push('        max-width: 100%;');
        lines.push('    }');
        lines.push('');
        lines.push('    .instagram-carousel-arrow {');
        lines.push('        width: 36px;');
        lines.push('        height: 36px;');
        lines.push('        font-size: 22px;');
        lines.push('        line-height: 36px;');
        lines.push('    }');
        lines.push('}');
        lines.push('</style>');
        lines.push('');
        lines.push('<div class="text-center pad-vert-2x instagram-carousel-section">');
        lines.push('    <div class="instagram-carousel-wrap">');
        lines.push('        <button type="button" class="instagram-carousel-arrow instagram-carousel-prev" aria-label="Previous Instagram post">');
        lines.push('            <span aria-hidden="true">&#10094;</span>');
        lines.push('        </button>');
        lines.push('');
        lines.push('        <div class="instagram-carousel-track">');
        lines.push(buildSlides(items));
        lines.push('        </div>');
        lines.push('');
        lines.push('        <button type="button" class="instagram-carousel-arrow instagram-carousel-next" aria-label="Next Instagram post">');
        lines.push('            <span aria-hidden="true">&#10095;</span>');
        lines.push('        </button>');
        lines.push('    </div>');
        lines.push('');
        lines.push('    <script async src="https://www.instagram.com/embed.js"></script>');
        lines.push('</div>');
        lines.push('');
        lines.push('<script>');
        lines.push('(function() {');
        lines.push('    function ready(callback) {');
        lines.push('        if (document.readyState !== "loading") {');
        lines.push('            callback();');
        lines.push('        } else {');
        lines.push('            document.addEventListener("DOMContentLoaded", callback);');
        lines.push('        }');
        lines.push('    }');
        lines.push('');
        lines.push('    function processInstagramEmbeds() {');
        lines.push('        if (window.instgrm && window.instgrm.Embeds) {');
        lines.push('            window.instgrm.Embeds.process();');
        lines.push('        }');
        lines.push('    }');
        lines.push('');
        lines.push('    function setupInstagramCarousel(section) {');
        lines.push('        var track = section.querySelector(".instagram-carousel-track");');
        lines.push('        var prevButton = section.querySelector(".instagram-carousel-prev");');
        lines.push('        var nextButton = section.querySelector(".instagram-carousel-next");');
        lines.push('');
        lines.push('        if (!track || !prevButton || !nextButton) {');
        lines.push('            return;');
        lines.push('        }');
        lines.push('');
        lines.push('        var slides = Array.prototype.slice.call(track.querySelectorAll(".instagram-slide"));');
        lines.push('        var currentIndex = 0;');
        lines.push('        var scrollFrame = null;');
        lines.push('');
        lines.push('        function getVisibleCount() {');
        lines.push('            if (!slides.length) {');
        lines.push('                return 1;');
        lines.push('            }');
        lines.push('');
        lines.push('            var trackWidth = track.getBoundingClientRect().width;');
        lines.push('            var slideWidth = slides[0].getBoundingClientRect().width;');
        lines.push('            var trackStyle = window.getComputedStyle(track);');
        lines.push('            var gap = parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;');
        lines.push('');
        lines.push('            if (!slideWidth) {');
        lines.push('                return 1;');
        lines.push('            }');
        lines.push('');
        lines.push('            return Math.max(1, Math.round((trackWidth + gap) / (slideWidth + gap)));');
        lines.push('        }');
        lines.push('');
        lines.push('        function getMaxIndex() {');
        lines.push('            return Math.max(0, slides.length - getVisibleCount());');
        lines.push('        }');
        lines.push('');
        lines.push('        function getTargetLeft(index) {');
        lines.push('            var trackRect = track.getBoundingClientRect();');
        lines.push('            var slideRect = slides[index].getBoundingClientRect();');
        lines.push('');
        lines.push('            return track.scrollLeft + (slideRect.left - trackRect.left);');
        lines.push('        }');
        lines.push('');
        lines.push('        function updateButtons() {');
        lines.push('            var maxIndex = getMaxIndex();');
        lines.push('');
        lines.push('            if (currentIndex > maxIndex) {');
        lines.push('                currentIndex = maxIndex;');
        lines.push('            }');
        lines.push('');
        lines.push('            prevButton.disabled = currentIndex <= 0;');
        lines.push('            nextButton.disabled = currentIndex >= maxIndex;');
        lines.push('        }');
        lines.push('');
        lines.push('        function syncIndexToScroll() {');
        lines.push('            var trackRect = track.getBoundingClientRect();');
        lines.push('            var closestIndex = 0;');
        lines.push('            var closestDistance = Infinity;');
        lines.push('');
        lines.push('            for (var i = 0; i < slides.length; i++) {');
        lines.push('                var slideRect = slides[i].getBoundingClientRect();');
        lines.push('                var distance = Math.abs(slideRect.left - trackRect.left);');
        lines.push('');
        lines.push('                if (distance < closestDistance) {');
        lines.push('                    closestDistance = distance;');
        lines.push('                    closestIndex = i;');
        lines.push('                }');
        lines.push('            }');
        lines.push('');
        lines.push('            currentIndex = Math.min(closestIndex, getMaxIndex());');
        lines.push('            updateButtons();');
        lines.push('        }');
        lines.push('');
        lines.push('        function goToIndex(index, animate) {');
        lines.push('            currentIndex = Math.max(0, Math.min(index, getMaxIndex()));');
        lines.push('');
        lines.push('            if (!slides[currentIndex]) {');
        lines.push('                updateButtons();');
        lines.push('                return;');
        lines.push('            }');
        lines.push('');
        lines.push('            track.scrollTo({');
        lines.push('                left: getTargetLeft(currentIndex),');
        lines.push('                behavior: animate === false ? "auto" : "smooth"');
        lines.push('            });');
        lines.push('');
        lines.push('            updateButtons();');
        lines.push('        }');
        lines.push('');
        lines.push('        prevButton.addEventListener("click", function() {');
        lines.push('            goToIndex(currentIndex - 1, true);');
        lines.push('        });');
        lines.push('');
        lines.push('        nextButton.addEventListener("click", function() {');
        lines.push('            goToIndex(currentIndex + 1, true);');
        lines.push('        });');
        lines.push('');
        lines.push('        track.addEventListener("scroll", function() {');
        lines.push('            if (scrollFrame) {');
        lines.push('                window.cancelAnimationFrame(scrollFrame);');
        lines.push('            }');
        lines.push('');
        lines.push('            scrollFrame = window.requestAnimationFrame(function() {');
        lines.push('                syncIndexToScroll();');
        lines.push('            });');
        lines.push('        });');
        lines.push('');
        lines.push('        window.addEventListener("resize", function() {');
        lines.push('            goToIndex(currentIndex, false);');
        lines.push('        });');
        lines.push('');
        lines.push('        updateButtons();');
        lines.push('');
        lines.push('        setTimeout(function() {');
        lines.push('            processInstagramEmbeds();');
        lines.push('            goToIndex(currentIndex, false);');
        lines.push('        }, 500);');
        lines.push('');
        lines.push('        setTimeout(function() {');
        lines.push('            processInstagramEmbeds();');
        lines.push('            goToIndex(currentIndex, false);');
        lines.push('        }, 1500);');
        lines.push('');
        lines.push('        setTimeout(function() {');
        lines.push('            processInstagramEmbeds();');
        lines.push('            goToIndex(currentIndex, false);');
        lines.push('        }, 3000);');
        lines.push('    }');
        lines.push('');
        lines.push('    ready(function() {');
        lines.push('        var sections = document.querySelectorAll(".instagram-carousel-section");');
        lines.push('');
        lines.push('        for (var i = 0; i < sections.length; i++) {');
        lines.push('            setupInstagramCarousel(sections[i]);');
        lines.push('        }');
        lines.push('    });');
        lines.push('');
        lines.push('    window.addEventListener("load", function() {');
        lines.push('        processInstagramEmbeds();');
        lines.push('    });');
        lines.push('})();');
        lines.push('</script>');

        return lines.join('\n');
    }

    function showStatus(message, type) {
        var status = byId('igcgStatus');
        status.className = 'igcg-status ' + (type || '');
        status.innerHTML = message;
    }

    function addDemoUrls() {
        var input = byId('igcgPostInput');
        var existingLines = input.value.split(/\r?\n/);
        var existingMap = {};
        var finalLines = [];
        var addedCount = 0;

        for (var i = 0; i < existingLines.length; i++) {
            var existingLine = existingLines[i].trim();

            if (existingLine) {
                existingMap[existingLine] = true;
                finalLines.push(existingLine);
            }
        }

        for (var j = 0; j < demoUrls.length; j++) {
            if (!existingMap[demoUrls[j]]) {
                finalLines.push(demoUrls[j]);
                addedCount++;
            }
        }

        input.value = finalLines.join('\n');

        if (addedCount) {
            showStatus('Demo URLs added. Click Generate Carousel Code to create the carousel code.', 'success');
        } else {
            showStatus('The demo URLs are already in the list.', 'success');
        }
    }

    function generateCode() {
        var input = byId('igcgPostInput').value;
        var defaultType = byId('igcgDefaultType').value;
        var result = parseInstagramItems(input, defaultType);

        if (!result.items.length) {
            byId('igcgOutput').value = '';
            showStatus('No valid Instagram posts or reels were found. Please check the URLs or IDs.', 'error');
            return false;
        }

        var code = buildCarouselCode(result.items);
        byId('igcgOutput').value = code;

        var message = 'Generated carousel code for ' + result.items.length + ' Instagram item';

        if (result.items.length !== 1) {
            message += 's';
        }

        message += '.';

        if (result.errors.length) {
            var escapedErrors = [];

            for (var i = 0; i < result.errors.length; i++) {
                escapedErrors.push(escapeHtml(result.errors[i]));
            }

            message += '<br>Some lines were skipped:<br>' + escapedErrors.join('<br>');
        }

        showStatus(message, result.errors.length ? 'error' : 'success');
        return true;
    }

    function copyCode() {
        var output = byId('igcgOutput');

        if (!output.value) {
            showStatus('Generate the carousel code before copying.', 'error');
            return;
        }

        output.focus();
        output.select();

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(output.value).then(function() {
                showStatus('Carousel code copied.', 'success');
            }).catch(function() {
                document.execCommand('copy');
                showStatus('Carousel code copied.', 'success');
            });
        } else {
            document.execCommand('copy');
            showStatus('Carousel code copied.', 'success');
        }
    }

    function updatePreview() {
        var code = byId('igcgOutput').value;
        var iframe = byId('igcgPreviewFrame');

        if (!code) {
            var generated = generateCode();

            if (!generated) {
                showStatus('Generate the carousel code before updating the preview.', 'error');
                return;
            }

            code = byId('igcgOutput').value;
        }

        var previewDocument = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html, body { margin: 0; padding: 0; overflow-x: hidden; min-height: 1000px; }</style></head><body>' + code + '</body></html>';

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(previewDocument);
        iframe.contentWindow.document.close();
    }

    function clearUrls() {
        byId('igcgPostInput').value = '';
        byId('igcgOutput').value = '';
        byId('igcgPreviewFrame').removeAttribute('srcdoc');
        var iframe = byId('igcgPreviewFrame');
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write('');
        iframe.contentWindow.document.close();
        showStatus('URL field cleared.', 'success');
    }

    ready(function() {
        byId('igcgDemoBtn').addEventListener('click', addDemoUrls);
        byId('igcgGenerateBtn').addEventListener('click', generateCode);
        byId('igcgCopyBtn').addEventListener('click', copyCode);
        byId('igcgPreviewBtn').addEventListener('click', updatePreview);
        byId('igcgClearBtn').addEventListener('click', clearUrls);
    });
})();
