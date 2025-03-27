import os
import subprocess
import sys
import threading
import time
import tkinter as tk
from tkinter import ttk
from datetime import datetime

class ProcessMonitor:
    def __init__(self, exe_path):
        self.exe_path = exe_path
        self.monitoring = False
        self.process = None
        self.failure_count = 0
        self.lock = threading.Lock()
        self.condition = threading.Condition(self.lock)
        self.log_callback = None
        self.running = True

    def set_log_callback(self, callback):
        self.log_callback = callback

    def log(self, message):
        if self.log_callback:
            timestamp = datetime.now().strftime("%m-%d %H:%M:%S")
            self.log_callback(f"[{timestamp}] {message}")

    def is_process_running(self):
        try:
            process_list = subprocess.check_output(['tasklist'], shell=True).decode('utf-8', errors='ignore')
            return os.path.basename(self.exe_path) in process_list
        except Exception as e:
            self.log(f"检查进程状态错误: {e}")
            return False

    def start_process(self):
        try:
            self.process = subprocess.Popen([self.exe_path], shell=True)
            self.log(f"进程已启动: {self.exe_path}")
            self.failure_count = 0
        except Exception as e:
            self.failure_count += 1
            self.log(f"启动进程失败: {e}")
            if self.failure_count >= 5:
                self.log("123")
                self.failure_count = 0

    def monitor(self):
        while self.running:
            with self.lock:
                while not self.monitoring and self.running:
                    self.condition.wait()
                
                if not self.running:
                    break

            if self.monitoring:
                if not self.is_process_running():
                    self.log(f"进程未运行，正在启动: {self.exe_path}")
                    self.start_process()
                time.sleep(2)
            else:
                time.sleep(1)

    def start_monitoring(self):
        with self.lock:
            self.monitoring = True
            self.condition.notify_all()

    def stop_monitoring(self):
        with self.lock:
            self.monitoring = False
            self.condition.notify_all()

    def stop(self):
        with self.lock:
            self.running = False
            self.monitoring = False
            self.condition.notify_all()

class RoundedButton(tk.Canvas):
    def __init__(self, parent, text, command, width=120, height=32, corner_radius=6, **kwargs):
        # 从 kwargs 中移除不支持的属性
        self.bg_color = kwargs.pop('bg', '#1890ff')
        self.hover_color = kwargs.pop('activebackground', '#40a9ff')
        
        super().__init__(parent, width=width, height=height, highlightthickness=0, bg=parent['bg'])
        self.command = command
        self.text = text
        self.corner_radius = corner_radius
        self.width = width
        self.height = height
        self.current_bg = self.bg_color
        
        self.bind('<Enter>', self.on_enter)
        self.bind('<Leave>', self.on_leave)
        self.bind('<Button-1>', self.on_click)
        
        self.draw()
    
    def draw(self):
        self.delete('all')
        # 绘制圆角矩形
        self.create_rounded_rect(0, 0, self.width, self.height, self.corner_radius, self.current_bg)
        # 绘制文本
        self.create_text(self.width/2, self.height/2, text=self.text, fill='white', 
                        font=('Microsoft YaHei UI', 12))
    
    def create_rounded_rect(self, x1, y1, x2, y2, radius, color):
        # 绘制圆角矩形的各个部分
        points = [
            x1+radius, y1,
            x1+radius, y1,
            x2-radius, y1,
            x2-radius, y1,
            x2, y1,
            x2, y1+radius,
            x2, y2-radius,
            x2, y2,
            x2-radius, y2,
            x2-radius, y2,
            x1+radius, y2,
            x1+radius, y2,
            x1, y2,
            x1, y2-radius,
            x1, y1+radius,
            x1, y1
        ]
        return self.create_polygon(points, fill=color, smooth=True)
    
    def on_enter(self, event):
        self.current_bg = self.hover_color
        self.draw()
    
    def on_leave(self, event):
        self.current_bg = self.bg_color
        self.draw()
    
    def on_click(self, event):
        if self.command:
            self.command()
    
    def configure(self, **kwargs):
        if 'bg' in kwargs:
            self.bg_color = kwargs['bg']
            self.current_bg = self.bg_color
            self.draw()
        if 'activebackground' in kwargs:
            self.hover_color = kwargs['activebackground']
        if 'text' in kwargs:
            self.text = kwargs['text']
            self.draw()

class MainWindow:
    def __init__(self, root):
        self.root = root
        self.exe_name = "dabudian.exe"
        self.setup_ui()
        self.setup_monitor()
        
        # 确保窗口显示在最前面
        self.root.after(100, self.ensure_window_visible)

    def ensure_window_visible(self):
        self.root.lift()
        self.root.focus_force()
        
        # 根据不同操作系统设置窗口层级
        if sys.platform == 'darwin':  # macOS
            self.root.attributes('-topmost', 1)
            self.root.after(1000, lambda: self.root.attributes('-topmost', 0))
        elif sys.platform == 'win32':  # Windows
            self.root.attributes('-topmost', 1)
            self.root.wm_attributes('-topmost', 1)
            self.root.after(1000, lambda: self.root.attributes('-topmost', 0))
            self.root.after(1000, lambda: self.root.wm_attributes('-topmost', 0))
        
        # 1秒后再次检查
        self.root.after(1000, self.ensure_window_visible)

    def setup_ui(self):
        # Ant Design 颜色变量
        self.antd_colors = {
            'primary': '#1890ff',
            'primary_hover': '#40a9ff',
            'success': '#52c41a',
            'error': '#ff4d4f',
            'background': '#f5f5f5',
            'component_background': '#ffffff',
            'border': '#f0f0f0',  # 更改为更浅的边框颜色
            'text': '#333333',
            'text_secondary': '#666666'
        }

        self.root.title("大不点守护程序")
        self.root.geometry("600x400")
        self.root.resizable(False, False)
        
        # 设置窗口居中
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = (screen_width - 600) // 2
        y = (screen_height - 400) // 2
        self.root.geometry(f"600x400+{x}+{y}")
        
        # 设置背景色
        self.root.configure(bg=self.antd_colors['background'])

        # 创建主框架
        main_frame = tk.Frame(self.root, bg=self.antd_colors['background'])
        main_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=16)  # 减小外边距

        # 创建顶部卡片式面板
        top_card = tk.Frame(
            main_frame,
            bg=self.antd_colors['component_background'],
        )
        top_card.pack(fill=tk.X, pady=(0, 12))

        # 创建圆角和阴影效果的画布
        top_canvas = tk.Canvas(
            top_card,
            bg=self.antd_colors['component_background'],
            highlightthickness=0,
            height=56  # 控制面板高度
        )
        top_canvas.pack(fill=tk.X)
        
        # 绘制圆角矩形
        def draw_rounded_rect(canvas):
            canvas.delete('all')
            w = canvas.winfo_width()
            h = canvas.winfo_height()
            radius = 8  # Ant Design 标准圆角
            
            # 创建圆角路径
            canvas.create_polygon(
                radius, 0,                    # 左上角起点
                w-radius, 0,                  # 上边
                w, 0,
                w, radius,
                w, h-radius,                  # 右边
                w, h,
                w-radius, h,                  # 下边
                radius, h,
                0, h,
                0, h-radius,                  # 左边
                0, radius,
                0, 0,
                fill=self.antd_colors['component_background'],
                outline=self.antd_colors['border'],
                smooth=True
            )

        # 绑定重绘事件
        top_canvas.bind('<Configure>', lambda e: draw_rounded_rect(top_canvas))

        # 创建按钮和状态标签框架
        control_frame = tk.Frame(top_canvas, bg=self.antd_colors['component_background'])
        control_frame.pack(fill=tk.X, padx=12, pady=12)

        self.status_label = tk.Label(
            control_frame, 
            text="状态: 未运行",
            bg=self.antd_colors['component_background'],
            fg=self.antd_colors['error'],
            font=('Microsoft YaHei UI', 14)
        )
        self.status_label.pack(side=tk.LEFT)

        # Ant Design 按钮样式
        button_style = {
            'bg': self.antd_colors['primary'],
            'activebackground': self.antd_colors['primary_hover'],
            'width': 120,
            'height': 32,
            'corner_radius': 6
        }

        # 创建按钮容器
        button_frame = tk.Frame(
            control_frame,
            bg=self.antd_colors['component_background']
        )
        button_frame.pack(side=tk.RIGHT)

        # 使用新的圆角按钮类
        self.monitor_button = RoundedButton(
            button_frame,
            text="开始监控",
            command=self.toggle_monitoring,
            **button_style
        )
        self.monitor_button.pack(padx=1, pady=1)

        # 创建日志卡片
        log_card = tk.Frame(
            main_frame,
            bg=self.antd_colors['component_background'],
        )
        log_card.pack(fill=tk.BOTH, expand=True)

        # 创建日志区域的圆角画布
        log_canvas = tk.Canvas(
            log_card,
            bg=self.antd_colors['component_background'],
            highlightthickness=0
        )
        log_canvas.pack(fill=tk.BOTH, expand=True)
        
        # 绑定重绘事件
        log_canvas.bind('<Configure>', lambda e: draw_rounded_rect(log_canvas))

        # 创建日志文本区域
        self.log_text = tk.Text(
            log_canvas,
            wrap=tk.WORD,
            bg=self.antd_colors['component_background'],
            fg=self.antd_colors['text_secondary'],
            insertbackground=self.antd_colors['text'],
            selectbackground=self.antd_colors['primary'],
            selectforeground='white',
            relief='flat',
            font=('Microsoft YaHei UI', 10),
            padx=6,
            pady=6,
            borderwidth=0,
            highlightthickness=0
        )
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=6, pady=6)
        self.log_text.config(state=tk.DISABLED)

    def setup_monitor(self):
        self.exe_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), self.exe_name)
        
        if not os.path.isfile(self.exe_path):
            self.append_log(f"错误: {self.exe_path} 不存在")
            self.monitor_button['state'] = 'disabled'
            return

        self.monitor = ProcessMonitor(self.exe_path)
        self.monitor.set_log_callback(self.append_log)
        self.monitor_thread = threading.Thread(target=self.monitor.monitor, daemon=True)
        self.monitor_thread.start()

    def toggle_monitoring(self):
        if not hasattr(self, 'monitor'):
            return

        if self.monitor.monitoring:
            self.monitor.stop_monitoring()
            self.monitor_button.configure(
                text="开始监控",
                bg=self.antd_colors['primary'],
                activebackground=self.antd_colors['primary_hover']
            )
            self.status_label.configure(
                text="状态: 已停止",
                fg=self.antd_colors['error']
            )
            self.append_log("监控已暂停")
        else:
            self.monitor.start_monitoring()
            self.monitor_button.configure(
                text="停止监控",
                bg=self.antd_colors['error'],
                activebackground='#ff7875'  # Ant Design 红色悬停色
            )
            self.status_label.configure(
                text="状态: 运行中",
                fg=self.antd_colors['success']
            )
            self.append_log("监控已启动")

    def append_log(self, message):
        def _append():
            self.log_text.config(state=tk.NORMAL)
            
            # 检查日志行数
            lines = self.log_text.get('1.0', tk.END).splitlines()
            if len(lines) > 1000:
                # 保留最后1000行
                self.log_text.delete('1.0', tk.END)
                self.log_text.insert(tk.END, '\n'.join(lines[-1000:]) + '\n')
            
            # 添加新日志
            self.log_text.insert(tk.END, message + "\n")
            self.log_text.see(tk.END)
            self.log_text.config(state=tk.DISABLED)
            
        self.root.after(0, _append)

    def on_closing(self):
        if hasattr(self, 'monitor'):
            self.monitor.stop()
        self.root.destroy()

def main():
    root = tk.Tk()
    root.title("大不点守护程序")
    
    # 设置应用图标
    try:
        if sys.platform == 'darwin':  # macOS
            # macOS 下使用 .png 文件
            icon_path = os.path.join(os.path.dirname(__file__), 'icon', 'app.png')
            if os.path.exists(icon_path):
                img = tk.PhotoImage(file=icon_path)
                root.tk.call('wm', 'iconphoto', root._w, img)
        else:  # Windows
            # Windows 下使用 .ico 文件
            icon_path = os.path.join(os.path.dirname(__file__), 'icon', 'app.ico')
            if os.path.exists(icon_path):
                root.iconbitmap(icon_path)
    except Exception as e:
        print(f"设置图标失败: {e}")
    
    # 设置窗口在最前面显示
    root.lift()
    root.focus_force()
    
    # 根据不同操作系统设置窗口层级
    if sys.platform == 'darwin':  # macOS
        root.attributes('-topmost', 1)
    elif sys.platform == 'win32':  # Windows
        root.attributes('-topmost', 1)
        root.wm_attributes('-topmost', 1)  # Windows 特定方法
    
    app = MainWindow(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
