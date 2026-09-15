/*
 * Minimal X11/XWayland input bridge for the Linux Kimi Work port.
 *
 * Only pointer motion and wheel buttons are exposed.  The helper deliberately
 * has no arbitrary key injection or command execution surface; it is invoked
 * with a fixed operation and bounded integer arguments by kimi-scroll-input.
 * Wayland compositors that do not provide XWayland simply return a non-zero
 * status, allowing the adapter to report an honest unavailable capability.
 */
#define _POSIX_C_SOURCE 200809L

#include <X11/Xlib.h>
#include <X11/extensions/XTest.h>

#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int parse_int(const char *text, int *out) {
    char *end = NULL;
    long value;
    if (text == NULL || out == NULL || *text == '\0') return 0;
    errno = 0;
    value = strtol(text, &end, 10);
    if (errno != 0 || end == text || *end != '\0' || value < INT_MIN || value > INT_MAX) return 0;
    *out = (int)value;
    return 1;
}

static int move_pointer(Display *display, int x, int y) {
    if (!XTestFakeMotionEvent(display, -1, x, y, CurrentTime)) return 0;
    return XFlush(display) != 0;
}

static int scroll_wheel(Display *display, int x, int y, int lines) {
    const unsigned int button = lines < 0 ? 5U : 4U;
    int count = lines < 0 ? -lines : lines;
    if (!move_pointer(display, x, y)) return 0;
    if (count > 12) count = 12;
    for (int index = 0; index < count; index++) {
        if (!XTestFakeButtonEvent(display, button, True, CurrentTime) ||
            !XTestFakeButtonEvent(display, button, False, CurrentTime)) return 0;
    }
    return XFlush(display) != 0;
}

int main(int argc, char **argv) {
    int x = 0;
    int y = 0;
    int lines = 0;
    int event_base = 0;
    int error_base = 0;
    int major = 0;
    int minor = 0;
    Display *display;
    int ok = 0;

    if (argc < 4 || (strcmp(argv[1], "move") != 0 && strcmp(argv[1], "scroll") != 0) ||
        !parse_int(argv[2], &x) || !parse_int(argv[3], &y)) return 64;
    if (strcmp(argv[1], "scroll") == 0) {
        if (argc != 5 || !parse_int(argv[4], &lines) || lines < -12 || lines > 12 || lines == 0) return 64;
    } else if (argc != 4) {
        return 64;
    }
    display = XOpenDisplay(NULL);
    if (display == NULL) return 69;
    if (!XTestQueryExtension(display, &event_base, &error_base, &major, &minor)) {
        XCloseDisplay(display);
        return 69;
    }
    if (strcmp(argv[1], "move") == 0) ok = move_pointer(display, x, y);
    else ok = scroll_wheel(display, x, y, lines);
    XSync(display, False);
    XCloseDisplay(display);
    return ok ? 0 : 70;
}
