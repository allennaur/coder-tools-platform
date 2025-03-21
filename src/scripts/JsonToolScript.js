import ToastService from '@/utils/ToastService';

export default {
  data() {
    return {
      jsonInput: '',
      formattedJson: [],
      jsonResult: '',
      jsonError: false,
      jsonErrorMessage: '',
      hasRepairSuggestion: false,
      repairSuggestion: '',
      leftPanelWidth: 50,
      minPanelWidth: 200,
      leftMinPanelWidth: 200, // 左侧面板动态最小宽度
      rightMinPanelWidth: 200, // 右侧面板动态最小宽度
      isResizing: false,
      isHovering: false,
      initialX: 0,
      initialWidth: 0,
      containerWidth: 0,
      collapsedLines: new Set(), // 记录被折叠的行
      collapsibleRanges: [], // 存储可折叠范围 [开始行, 结束行]
      lineTypes: [], // 存储每行的类型 (object-start, array-start, object-end, array-end, key-value)
      hoveredLine: null, // 当前鼠标悬浮的行
      visibleJsonLines: [], // 当前显示的JSON行
      completeJsonString: '', // 完整的JSON字符串（用于复制）
      exampleJson: '{"basic":{"name":"Coder Tools Platform","version":"1.0.0","description":"一个功能强大的开发者工具集合","author":{"name":"开发者","email":"dev@example.com","url":"https://example.com"},"license":"MIT","repository":"https://github.com/example/coder-tools-platform"},"features":[{"id":1,"name":"JSON工具","active":true,"capabilities":["格式化","验证","压缩","转换"],"usageCount":1284,"lastUsed":"2023-07-15T08:45:30.000Z"},{"id":2,"name":"时间戳转换","active":true,"capabilities":["Unix时间戳转换","ISO格式化","时区转换"],"usageCount":856,"lastUsed":"2023-07-14T15:22:12.000Z"},{"id":3,"name":"Java工具","active":true,"capabilities":["代码格式化","类结构分析","JSON转Java类"],"usageCount":542,"lastUsed":"2023-07-13T09:18:45.000Z"}],"config":{"theme":"light","fontSize":14,"autoSave":true,"notifications":false,"shortcuts":{"formatJson":"Ctrl+Shift+F","clearEditor":"Alt+C","saveContent":"Ctrl+S"},"dimensions":{"maxWidth":"1200px","sidebarWidth":"250px","mainContentWidth":"calc(100% - 250px)"},"api":{"baseUrl":"https://api.example.com/v1","timeout":30000,"retryAttempts":3,"headers":{"Authorization":"Bearer $TOKEN","Content-Type":"application/json","Accept-Language":"zh-CN"}}},"statistics":{"totalUsers":15420,"activeUsersToday":1240,"averageSessionTime":754.8,"popularFeatures":{"JSON工具":42.5,"时间戳转换":28.3,"Java工具":18.2,"其他":11.0},"growth":{"lastMonth":12.4,"lastQuarter":34.8,"lastYear":127.5}},"specialChars":"特殊字符测试: ~!@#$%^&*()_+`-=[]{}|;\':\\",./<>?","longText":"这是一个非常长的文本字段，用于测试JSON工具对长文本的处理能力。在实际应用中，我们可能会遇到包含大段文本的JSON数据，比如文章内容、日志记录、错误信息等。这些长文本可能会导致编辑器渲染变慢，所以一个好的JSON工具应该能够高效处理这类数据。同时，这也是对工具折叠功能的测试，看它是否能够正确地折叠和展开这样的长文本节点，提高用户在处理复杂JSON数据时的体验。","nestedObject":{"level1":{"level2":{"level3":{"level4":{"level5":{"value":"这是一个深度嵌套的对象，用于测试JSON工具的格式化和展示能力"}}}}}},"largeArray":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],"booleans":[true,false,true,false],"nullValue":null,"numberTypes":{"integer":42,"float":3.14159,"negative":-273.15,"scientific":6.022e23,"binary":10,"octal":493,"hex":255,"infinity":1.7976931348623157e+308},"dateTime":"2023-07-15T12:30:45.123Z","emptyValues":{"string":"","array":[],"object":{},"nullValue":null},"unicodeChars":"Unicode字符测试: 你好，世界！😊🌍🚀 こんにちは世界 안녕하세요 世界 Привет, мир!","base64Data":"SGVsbG8gV29ybGQgZnJvbSBCYXNlNjQgRW5jb2RlZCBTdHJpbmc=","urlEncoded":"https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Djson%20tools%26lang%3Dzh-CN"}',
      isXmlMode: false, // 标记当前是否为XML显示模式
      isYamlMode: false, // 标记当前是否为YAML显示模式
      isCsvMode: false, // 标记当前是否为CSV显示模式
      currentFormat: 'JSON', // 当前数据格式
      resizeRAF: null, // 用于requestAnimationFrame的ID
      lastResizeEvent: null, // 存储最后一个resize事件
      animationInProgress: false, // 标记是否有动画正在进行中
      isFullScreen: false, // 添加全屏状态标志
      previousPanelState: null, // 用于存储全屏前的面板状态
    }
  },
  computed: {
    // 判断是否有输入内容
    hasInputContent() {
      return !!this.jsonInput.trim();
    },
    
    // 判断是否有输出内容可供复制
    hasOutputContent() {
      // 检查是否有处理结果或错误信息
      if (this.jsonError) {
        return !!this.jsonErrorMessage; // 错误信息也可以复制
      }
      return !!this.completeJsonString;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.containerWidth = this.$el.offsetWidth;
      // 挂载后立即测量两侧面板头部实际宽度
      this.measurePanelsWidth();
      window.addEventListener('resize', this.measurePanelsWidth);
    });
    window.addEventListener('resize', this.handleResize);
    
    // 添加ESC键退出全屏
    document.addEventListener('keydown', this.handleEscKey);
  },
  beforeUnmount() {
    if (this.isFullScreen) {
      document.body.style.overflow = '';
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('resize', this.measurePanelsWidth);
    document.removeEventListener('mousemove', this.doResize);
    document.removeEventListener('mouseup', this.stopResize);
    
    // 添加ESC键监听器清理
    document.removeEventListener('keydown', this.handleEscKey);
  },
  methods: {
    handleResize() {
      this.containerWidth = this.$el.offsetWidth;
      this.adjustPanelsWidth();
    },
    adjustPanelsWidth() {
      // 将像素值转换为百分比
      const leftMinPercent = (this.leftMinPanelWidth / this.containerWidth) * 100;
      const rightMinPercent = (this.rightMinPanelWidth / this.containerWidth) * 100;
      
      // 检查总体是否超出容器宽度
      const totalMinPercent = leftMinPercent + rightMinPercent;
      
      if (totalMinPercent > 100) {
        // 如果两侧最小宽度总和超过容器宽度，按比例分配
        const ratio = 100 / totalMinPercent;
        const adjustedLeftPercent = leftMinPercent * ratio;
        const adjustedRightPercent = rightMinPercent * ratio;
        
        this.leftPanelWidth = Math.max(this.leftPanelWidth, adjustedLeftPercent);
        
        // 确保右侧不小于最小宽度
        if ((100 - this.leftPanelWidth) < adjustedRightPercent) {
          this.leftPanelWidth = 100 - adjustedRightPercent;
        }
      } else {
        // 正常情况下确保两侧面板不小于最小宽度
        if (this.leftPanelWidth < leftMinPercent) {
          this.leftPanelWidth = leftMinPercent;
        }
        
        // 确保右侧不小于最小宽度
        if ((100 - this.leftPanelWidth) < rightMinPercent) {
          this.leftPanelWidth = 100 - rightMinPercent;
        }
      }
    },
    isExpandable(line) {
      return line.includes('{') || line.includes('[');
    },
    toggleNode(event) {
      if (!event.target.classList.contains('clickable')) return;
      
      const lineElement = event.target.closest('.json-line');
      if (!lineElement) return;
      
      const nodeId = lineElement.getAttribute('data-node-id');
      if (nodeId) {
        if (this.expandedNodes.has(nodeId)) {
          this.expandedNodes.delete(nodeId);
        } else {
          this.expandedNodes.add(nodeId);
        }
        this.processJson();
      }
    },
    processJson() {
      // 重置所有格式模式
      this.resetAllFormatModes();
      
      if (!this.jsonInput.trim()) {
        this.formattedJson = [];
        this.visibleJsonLines = [];
        this.jsonResult = '';
        this.jsonError = false;
        this.hasRepairSuggestion = false;
        return;
      }
      
      try {
        const parsedJson = JSON.parse(this.jsonInput);
        
        this.jsonError = false;
        this.jsonErrorMessage = '';
        this.hasRepairSuggestion = false;
        
        // 保存完整的JSON字符串用于复制
        this.jsonResult = JSON.stringify(parsedJson, null, 2);
        this.completeJsonString = this.jsonResult;
        
        // 格式化并处理显示
        this.formatJsonToHtml(parsedJson);
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        
        this.tryRepairJson();
      }
    },
    formatJsonToHtml(json, isCompressed = false) {
      // 根据是否压缩选择不同的格式化方式
      const stringified = isCompressed ? 
        JSON.stringify(json) : 
        JSON.stringify(json, null, 2);
      
      const lines = stringified.split('\n');
      
      // 跟踪每一行的原始索引、内容和缩进级别
      this.formattedJson = lines.map((line, index) => {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[0].length : 0;
        
        // 为每一行标记类型
        let type = 'regular';
        if (index === 0) type = 'root-start';
        else if (index === lines.length - 1) type = 'root-end';
        else if (line.trim().endsWith('{')) type = 'object-start';
        else if (line.trim().endsWith('[')) type = 'array-start';
        else if (line.trim() === '}' || line.trim() === '},') type = 'object-end';
        else if (line.trim() === ']' || line.trim() === '],') type = 'array-end';
        
        // 处理每行的HTML内容
        let formattedLine = line
          .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = 'json-key';
              } else {
                cls = 'json-string';
              }
            } else if (/true|false/.test(match)) {
              cls = 'json-boolean';
            } else if (/null/.test(match)) {
              cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
          });
        
        return {
          originalIndex: index,
          content: formattedLine,
          indent,
          type,
          collapsed: false
        };
      });
      
      // 重置折叠状态
      this.collapsedLines = new Set();
      
      // 处理优化显示
      this.processVisibleLines();
    },
    tryRepairJson() {
      const input = this.jsonInput;
      let suggestion = '';
      
      const openBraces = (input.match(/{/g) || []).length;
      const closeBraces = (input.match(/}/g) || []).length;
      const openBrackets = (input.match(/\[/g) || []).length;
      const closeBrackets = (input.match(/\]/g) || []).length;
      
      if (openBraces > closeBraces) {
        suggestion = input + '}';
        for (let i = 1; i < openBraces - closeBraces; i++) {
          suggestion += '}';
        }
        this.hasRepairSuggestion = true;
        this.repairSuggestion = `可能缺少 ${openBraces - closeBraces} 个结束花括号 "}"`;
      } else if (openBrackets > closeBrackets) {
        suggestion = input + ']';
        for (let i = 1; i < openBrackets - closeBrackets; i++) {
          suggestion += ']';
        }
        this.hasRepairSuggestion = true;
        this.repairSuggestion = `可能缺少 ${openBrackets - closeBrackets} 个结束方括号 "]"`;
      }
      
      const missingQuotesRegex = /([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g;
      if (missingQuotesRegex.test(input)) {
        const fixedInput = input.replace(missingQuotesRegex, '$1"$2"$3');
        if (!this.hasRepairSuggestion) {
          suggestion = fixedInput;
          this.hasRepairSuggestion = true;
          this.repairSuggestion = `属性名需要用双引号括起来`;
        }
      }
      
      const extraCommaRegex = /,(\s*[}\]])/g;
      if (extraCommaRegex.test(input)) {
        const fixedInput = input.replace(extraCommaRegex, '$1');
        if (!this.hasRepairSuggestion) {
          suggestion = fixedInput;
          this.hasRepairSuggestion = true;
          this.repairSuggestion = `JSON中对象或数组的最后一个元素后不能有逗号`;
        }
      }
      
      if (this.hasRepairSuggestion) {
        try {
          JSON.parse(suggestion);
          this.repairSuggestion = `${this.repairSuggestion}。点击"修复"按钮应用修复。`;
        } catch (e) {
          this.hasRepairSuggestion = false;
        }
      }
    },
    applyRepair() {
      if (!this.hasRepairSuggestion) return;
      
      const input = this.jsonInput;
      const openBraces = (input.match(/{/g) || []).length;
      const closeBraces = (input.match(/}/g) || []).length;
      const openBrackets = (input.match(/\[/g) || []).length;
      const closeBrackets = (input.match(/\]/g) || []).length;
      
      let fixedInput = input;
      
      if (openBraces > closeBraces) {
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixedInput += '}';
        }
      }
      
      if (openBrackets > closeBrackets) {
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixedInput += ']';
        }
      }
      
      fixedInput = fixedInput.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
      
      fixedInput = fixedInput.replace(/,(\s*[}\]])/g, '$1');
      
      this.jsonInput = fixedInput;
      this.processJson();
    },
    clearInput() {
      if (!this.hasInputContent) return; // 如果没有内容，不执行清空
      
      this.resetAllFormatModes();
      this.isXmlMode = false;
      this.jsonInput = '';
      this.formattedJson = [];
      this.visibleJsonLines = []; // 清空显示的行数据
      this.jsonResult = '';
      this.jsonError = false;
      this.jsonErrorMessage = '';
      this.hasRepairSuggestion = false;
      this.completeJsonString = ''; // 确保完整的JSON字符串也被清空
      this.collapsedLines = new Set(); // 重置折叠状态
      this.currentFormat = 'JSON';
    },
    copyToClipboard() {
      if (!this.hasOutputContent) return;
      
      // 使用完整的JSON字符串进行复制
      const textToCopy = this.jsonError ? '错误: ' + this.jsonErrorMessage : this.completeJsonString;
      
      if (!textToCopy) return;
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          ToastService.success('复制成功'); // 使用成功类型
        })
        .catch(err => {
          console.error('复制失败:', err);
          ToastService.error('复制失败，请手动复制'); // 使用错误类型
        });
    },
    handleHover() {
      this.isHovering = true;
    },
    handleLeave() {
      if (!this.isResizing) {
        this.isHovering = false;
      }
    },
    startResize(event) {
      this.isResizing = true;
      this.initialX = event.clientX;
      this.initialWidth = this.leftPanelWidth;
      this.containerWidth = this.$el.offsetWidth;
      
      // 直接在document上添加事件监听，提高响应速度
      document.addEventListener('mousemove', this.handleResizeEvent);
      document.addEventListener('mouseup', this.stopResize);
      
      // 添加body样式，防止文本选择和改变光标
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      
      // 添加类以禁用过渡动画
      this.$el.classList.add('resizing');
      
      event.preventDefault();
    },
    
    // 处理resize事件并使用RAF优化
    handleResizeEvent(event) {
      // 保存最后一次事件
      this.lastResizeEvent = event;
      
      // 如果已经有动画帧在排队，不再创建新的
      if (!this.resizeRAF) {
        this.resizeRAF = requestAnimationFrame(this.processResize);
      }
    },
    
    // 在动画帧中处理resize
    processResize() {
      this.resizeRAF = null;
      
      if (!this.isResizing || !this.lastResizeEvent) return;
      
      const event = this.lastResizeEvent;
      const deltaX = event.clientX - this.initialX;
      const deltaPercentage = (deltaX / this.containerWidth) * 100;
      
      // 计算新的左侧面板宽度百分比
      let newLeftPanelWidth = this.initialWidth + deltaPercentage;
      
      // 将左右两侧最小宽度转为百分比
      const leftMinPercent = (this.leftMinPanelWidth / this.containerWidth) * 100;
      const rightMinPercent = (this.rightMinPanelWidth / this.containerWidth) * 100;
      
      // 应用自然限制但添加一些弹性
      if (newLeftPanelWidth < leftMinPercent) {
        const overshoot = leftMinPercent - newLeftPanelWidth;
        // 使用非线性阻尼效果
        newLeftPanelWidth = leftMinPercent - (overshoot * Math.exp(-overshoot * 0.1));
      } else if ((100 - newLeftPanelWidth) < rightMinPercent) {
        const overshoot = rightMinPercent - (100 - newLeftPanelWidth);
        // 使用非线性阻尼效果
        newLeftPanelWidth = (100 - rightMinPercent) + (overshoot * Math.exp(-overshoot * 0.1));
      }
      
      // 更新面板宽度
      this.leftPanelWidth = newLeftPanelWidth;
      
      // 检查是否仍在拖动中，如果是则继续请求下一帧
      if (this.isResizing && !this.resizeRAF) {
        this.resizeRAF = requestAnimationFrame(this.processResize);
      }
    },
    
    stopResize() {
      if (!this.isResizing) return;
      
      // 取消任何待处理的动画帧
      if (this.resizeRAF) {
        cancelAnimationFrame(this.resizeRAF);
        this.resizeRAF = null;
      }
      
      this.isResizing = false;
      this.isHovering = false;
      document.removeEventListener('mousemove', this.handleResizeEvent);
      document.removeEventListener('mouseup', this.stopResize);
      
      // 移除body样式
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // 移除禁用过渡动画的类
      this.$el.classList.remove('resizing');
      
      // 恢复到有效的最小宽度，但使用平滑动画
      const leftMinPercent = (this.leftMinPanelWidth / this.containerWidth) * 100;
      const rightMinPercent = (this.rightMinPanelWidth / this.containerWidth) * 100;
      
      if (this.leftPanelWidth < leftMinPercent || (100 - this.leftPanelWidth) < rightMinPercent) {
        this.animateToValidWidth();
      }
    },
    
    // 平滑动画到有效宽度
    animateToValidWidth() {
      if (this.animationInProgress) return;
      
      const leftMinPercent = (this.leftMinPanelWidth / this.containerWidth) * 100;
      const rightMinPercent = (this.rightMinPanelWidth / this.containerWidth) * 100;
      
      let targetWidth;
      
      // 确定目标宽度
      if (this.leftPanelWidth < leftMinPercent) {
        targetWidth = leftMinPercent;
      } else if ((100 - this.leftPanelWidth) < rightMinPercent) {
        targetWidth = 100 - rightMinPercent;
      } else {
        return; // 已经在有效范围内
      }
      
      // 设置动画状态
      this.animationInProgress = true;
      
      // 创建动画函数
      const startWidth = this.leftPanelWidth;
      const totalDelta = targetWidth - startWidth;
      const startTime = performance.now();
      const duration = 250; // 动画持续250毫秒
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed >= duration) {
          // 动画结束，直接设置为目标值
          this.leftPanelWidth = targetWidth;
          this.animationInProgress = false;
          return;
        }
        
        // 使用easeOutExpo缓动函数计算当前值
        const progress = 1 - Math.pow(2, -10 * elapsed / duration);
        this.leftPanelWidth = startWidth + totalDelta * progress;
        
        // 继续动画
        requestAnimationFrame(animate);
      };
      
      // 开始动画
      requestAnimationFrame(animate);
    },
    
    // 显示自定义提示消息
    showToastMessage(message) {
      ToastService.success(message);
    },
    
    // 检查行是否可折叠
    isCollapsible(line) {
      // 检查参数是否为字符串
      if (typeof line !== 'string') {
        return false;
      }
      
      return (line.includes('": {') || line.includes('": [')) && 
             (line.trim().endsWith('{') || line.trim().endsWith('['));
    },
    
    // 检查行是否处于折叠状态
    isLineCollapsed(index) {
      return this.collapsedLines.has(index);
    },
    
    // 切换折叠状态
    toggleCollapse(index) {
      if (this.collapsedLines.has(index)) {
        this.collapsedLines.delete(index);
      } else {
        this.collapsedLines.add(index);
      }
      
      this.processVisibleLines();
    },
    
    // 处理可见行
    processVisibleLines() {
      // 创建一个新的行数组，包含所有行（包括根级别的括号）
      let processed = [...this.formattedJson];
      
      // 处理需要隐藏的行（被折叠的内容）
      const newVisibleLines = [];
      let skipUntilIndent = -1;
      let currentCollapsedCount = 0;
      
      for (let i = 0; i < processed.length; i++) {
        const line = processed[i];
        
        // 如果当前在跳过折叠内容模式
        if (skipUntilIndent >= 0) {
          if (line.indent <= skipUntilIndent) {
            // 到达折叠区域结束，添加一个折叠信息行
            if (currentCollapsedCount > 0) {
              const lastLine = newVisibleLines[newVisibleLines.length - 1];
              lastLine.folded = true;
              lastLine.collapsedCount = currentCollapsedCount;
              
              currentCollapsedCount = 0;
              skipUntilIndent = -1;
            }
            
            newVisibleLines.push({
              ...line,
              originalIndex: i
            });
          } else {
            currentCollapsedCount++;
          }
        } else {
          // 检查这一行是否被折叠了
          if (this.isCollapsible(line.content) && this.collapsedLines.has(i)) {
            skipUntilIndent = line.indent;
            currentCollapsedCount = 0;
          }
          
          newVisibleLines.push({
            ...line,
            originalIndex: i
          });
        }
      }
      
      this.visibleJsonLines = newVisibleLines;
    },
    
    // 获取行内容（为了处理折叠行）
    getLineContent(line, index) {
      // 如果是折叠了的对象/数组开始行，我们添加一个省略号指示
      if (this.isLineCollapsed(index)) {
        if (line.includes('": {')) {
          return line.replace('{', '{ ... }');
        } else if (line.includes('": [')) {
          return line.replace('[', '[ ... ]');
        }
      }
      return line;
    },
    
    // 获取行的缩进级别
    getLineIndent(line) {
      const match = line.match(/^(\s*)/);
      return match ? match[0].length / 2 : 0;
    },
    
    handleLineHover(index) {
      // 确保索引有效且在格式化的JSON范围内
      if (index === undefined || index < 0 || index >= this.formattedJson.length) {
        return;
      }
      
      const line = this.formattedJson[index];
      
      // 确保行对象有效且包含content属性
      if (line && line.content && typeof line.content === 'string') {
        if (this.isCollapsible(line.content)) {
          this.hoveredLine = index;
        }
      }
    },
    
    handleLineLeave() {
      this.hoveredLine = null;
    },
    
    insertExample() {
      // 设置示例JSON
      this.jsonInput = this.exampleJson;
      // 处理JSON以显示在右侧
      this.processJson();
      // 提示用户
      ToastService.info('已插入示例JSON数据'); // 使用信息类型
    },
    
    // 压缩JSON
    compressJson() {
      if (!this.hasInputContent) return;
      
      if (!this.jsonInput.trim()) {
        return;
      }
      
      try {
        // 解析JSON输入
        const parsedJson = JSON.parse(this.jsonInput);
        
        // 重新转为压缩的字符串
        this.jsonResult = JSON.stringify(parsedJson);
        this.completeJsonString = this.jsonResult;
        
        // 重置特殊格式模式
        this.resetAllFormatModes();
        
        // 重新格式化显示
        this.formatJsonToHtml(parsedJson, true);
        
        // 设置当前格式
        this.currentFormat = 'JSON (压缩)';
        
        // 状态改变后重新测量面板宽度
        this.$nextTick(() => {
          this.measurePanelsWidth();
        });
        
        // 显示提示
        this.showToastMessage('JSON 已压缩');
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        this.tryRepairJson();
        this.showToastMessage('JSON 压缩失败');
      }
    },
    
    // 格式化JSON
    formatJson() {
      if (!this.hasInputContent) return;
      
      if (!this.jsonInput.trim()) {
        return;
      }
      
      try {
        // 解析JSON输入
        const parsedJson = JSON.parse(this.jsonInput);
        
        // 重新转为格式化的字符串
        this.jsonResult = JSON.stringify(parsedJson, null, 2);
        this.completeJsonString = this.jsonResult;
        
        // 重置特殊格式模式
        this.resetAllFormatModes();
        
        // 重新格式化显示
        this.formatJsonToHtml(parsedJson);
        
        // 设置当前格式
        this.currentFormat = 'JSON';
        
        // 状态改变后重新测量面板宽度
        this.$nextTick(() => {
          this.measurePanelsWidth();
        });
        
        // 显示提示
        this.showToastMessage('JSON 已格式化');
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        this.tryRepairJson();
        this.showToastMessage('JSON 格式化失败');
      }
    },
    
    // 将 JSON 转换为 XML
    convertToXml() {
      if (!this.hasInputContent) return;
      
      if (!this.jsonInput.trim()) {
        return;
      }
      
      try {
        // 解析JSON输入
        const parsedJson = JSON.parse(this.jsonInput);
        
        // 转换为XML格式
        const xml = this.jsonToXml(parsedJson);
        
        // 存储转换后的XML
        this.jsonResult = xml;
        this.completeJsonString = xml;
        
        // 设置为XML模式，并重置其他模式
        this.resetAllFormatModes();
        this.isXmlMode = true;
        
        // 设置当前格式
        this.currentFormat = 'XML';
        
        // 在视图中显示XML
        this.displayXml(xml);
        
        // 状态改变后重新测量面板宽度
        this.$nextTick(() => {
          this.measurePanelsWidth();
        });
        
        // 显示提示
        this.showToastMessage('已转换为XML格式');
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        this.tryRepairJson();
        this.showToastMessage('转换XML失败');
      }
    },
    
    // JSON转XML的核心算法
    jsonToXml(obj, rootName = 'root') {
      let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<${rootName}>\n`;
      
      // 递归处理JSON对象
      const parseObject = (obj, indent = '  ') => {
        let result = '';
        
        for (const key in obj) {
          const value = obj[key];
          
          if (value === null || value === undefined) {
            // 处理null值
            result += `${indent}<${key} />\n`;
          } else if (Array.isArray(value)) {
            // 处理数组
            if (value.length === 0) {
              result += `${indent}<${key} />\n`;
            } else {
              for (const item of value) {
                if (typeof item === 'object' && item !== null) {
                  // 数组中的对象元素
                  result += `${indent}<${key}>\n${parseObject(item, indent + '  ')}${indent}</${key}>\n`;
                } else {
                  // 数组中的简单元素
                  result += `${indent}<${key}>${this.escapeXml(String(item))}</${key}>\n`;
                }
              }
            }
          } else if (typeof value === 'object') {
            // 处理对象
            result += `${indent}<${key}>\n${parseObject(value, indent + '  ')}${indent}</${key}>\n`;
          } else {
            // 处理基本类型
            result += `${indent}<${key}>${this.escapeXml(String(value))}</${key}>\n`;
          }
        }
        
        return result;
      };
      
      xml += parseObject(obj);
      xml += `</${rootName}>`;
      
      return xml;
    },
    
    // 转义XML特殊字符
    escapeXml(unsafe) {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    },
    
    // 在视图中显示XML内容
    displayXml(xml) {
      // 使用HTML语法高亮显示XML
      const formattedXml = xml
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => match)
        .split('\n');
      
      // 使用正则表达式高亮XML标签
      const highlightedXml = formattedXml.map(line => {
        return line.replace(/(&lt;\/?)([a-zA-Z0-9_:]+)(\s+[^&]*?)?(&gt;)/g, (match, p1, p2, p3, p4) => {
          // p1 = 开始标签符号(&lt; 或 &lt;/)
          // p2 = 标签名
          // p3 = 属性部分 (如果有)
          // p4 = 结束标签符号(&gt;)
          return `${p1}<span class="xml-tag">${p2}</span>${p3 || ''}${p4}`;
        });
      });
      
      this.formattedJson = highlightedXml.map((line, index) => {
        const indentMatch = line.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0].length : 0;
        
        return {
          originalIndex: index,
          content: line,
          indent: Math.floor(indent / 2), // XML的缩进通常是2个空格
          type: 'xml-line',
          collapsed: false
        };
      });
      
      // 清空折叠状态并刷新显示
      this.collapsedLines = new Set();
      this.processVisibleLines();
    },
    
    // 重置所有格式模式
    resetAllFormatModes() {
      this.isXmlMode = false;
      this.isYamlMode = false;
      this.isCsvMode = false;
      this.currentFormat = 'JSON';
      
      // 状态变化后重新测量面板宽度
      this.$nextTick(() => {
        this.measurePanelsWidth();
      });
    },
    
    // 将 JSON 转换为 YAML
    convertToYaml() {
      if (!this.hasInputContent) return;
      
      if (!this.jsonInput.trim()) {
        return;
      }
      
      try {
        // 解析JSON输入
        const parsedJson = JSON.parse(this.jsonInput);
        
        // 转换为YAML格式
        const yaml = this.jsonToYaml(parsedJson);
        
        // 存储转换后的YAML
        this.jsonResult = yaml;
        this.completeJsonString = yaml;
        
        // 设置为YAML模式，并重置其他模式
        this.resetAllFormatModes();
        this.isYamlMode = true;
        
        // 设置当前格式
        this.currentFormat = 'YAML';
        
        // 在视图中显示YAML
        this.displayFormattedText(yaml, 'yaml');
        
        // 状态改变后重新测量面板宽度
        this.$nextTick(() => {
          this.measurePanelsWidth();
        });
        
        // 显示提示
        this.showToastMessage('已转换为YAML格式');
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        this.tryRepairJson();
        this.showToastMessage('转换YAML失败');
      }
    },
    
    // JSON转YAML的核心算法
    jsonToYaml(obj, level = 0) {
      let yaml = '';
      const indent = ' '.repeat(level * 2);
      
      if (Array.isArray(obj)) {
        // 空数组特殊处理
        if (obj.length === 0) {
          return '[]';
        }
        
        // 处理数组
        for (const item of obj) {
          yaml += `${indent}- `;
          
          if (item === null) {
            yaml += 'null\n';
          } else if (typeof item === 'object') {
            // 对象或数组类型，需要换行并缩进
            yaml += '\n' + this.jsonToYaml(item, level + 1);
          } else if (typeof item === 'string') {
            // 字符串可能需要引号
            yaml += this.formatYamlString(item) + '\n';
          } else {
            // 其他简单类型
            yaml += String(item) + '\n';
          }
        }
      } else if (obj !== null && typeof obj === 'object') {
        // 处理对象
        for (const key in obj) {
          yaml += `${indent}${key}: `;
          
          if (obj[key] === null) {
            yaml += 'null\n';
          } else if (typeof obj[key] === 'object') {
            // 对象或数组类型，需要换行并缩进
            yaml += '\n' + this.jsonToYaml(obj[key], level + 1);
          } else if (typeof obj[key] === 'string') {
            // 字符串可能需要引号
            yaml += this.formatYamlString(obj[key]) + '\n';
          } else {
            // 其他简单类型
            yaml += String(obj[key]) + '\n';
          }
        }
      }
      
      return yaml;
    },
    
    // 格式化YAML字符串，必要时添加引号
    formatYamlString(str) {
      // 检查是否需要引号
      const needsQuotes = /[:{}[\],&*#?|<>=!%@`]/g.test(str) || 
                          /^\s|\s$/g.test(str) || 
                          ['true', 'false', 'null', 'y', 'n', 'yes', 'no', 'on', 'off'].includes(str.toLowerCase()) ||
                          !isNaN(str);
      
      if (needsQuotes) {
        // 转义双引号
        const escaped = str.replace(/"/g, '\\"');
        return `"${escaped}"`;
      }
      
      return str;
    },
    
    // 将 JSON 转换为 CSV
    convertToCsv() {
      if (!this.hasInputContent) return;
      
      if (!this.jsonInput.trim()) {
        return;
      }
      
      try {
        // 解析JSON输入
        const parsedJson = JSON.parse(this.jsonInput);
        
        // 转换为CSV格式
        const csv = this.jsonToCsv(parsedJson);
        
        if (!csv) {
          this.showToastMessage('此JSON结构无法转换为CSV格式');
          return;
        }
        
        // 存储转换后的CSV
        this.jsonResult = csv;
        this.completeJsonString = csv;
        
        // 设置为CSV模式，并重置其他模式
        this.resetAllFormatModes();
        this.isCsvMode = true;
        
        // 设置当前格式
        this.currentFormat = 'CSV';
        
        // 在视图中显示CSV
        this.displayFormattedText(csv, 'csv');
        
        // 状态改变后重新测量面板宽度
        this.$nextTick(() => {
          this.measurePanelsWidth();
        });
        
        // 显示提示
        this.showToastMessage('已转换为CSV格式');
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        this.tryRepairJson();
        this.showToastMessage('转换CSV失败');
      }
    },
    
    // JSON转CSV的核心算法
    jsonToCsv(json) {
      // 检查是否为数组
      if (!Array.isArray(json)) {
        // 如果是单个对象，将其包装为数组
        if (typeof json === 'object' && json !== null) {
          json = [json];
        } else {
          return null; // 无法转换为CSV
        }
      }
      
      // 如果数组为空，返回空字符串
      if (json.length === 0) {
        return '';
      }
      
      // 提取所有可能的字段名
      const fields = new Set();
      json.forEach(item => {
        if (item && typeof item === 'object') {
          Object.keys(item).forEach(key => fields.add(key));
        }
      });
      
      const fieldArray = Array.from(fields);
      
      // 生成CSV头部
      let csv = fieldArray.map(field => this.escapeCsvField(field)).join(',') + '\n';
      
      // 生成数据行
      json.forEach(item => {
        const row = fieldArray.map(field => {
          const value = item[field];
          
          if (value === undefined || value === null) {
            return '';
          }
          
          if (typeof value === 'object') {
            // 对象或数组转为JSON字符串
            return this.escapeCsvField(JSON.stringify(value));
          }
          
          return this.escapeCsvField(String(value));
        });
        
        csv += row.join(',') + '\n';
      });
      
      return csv;
    },
    
    // 转义CSV字段
    escapeCsvField(field) {
      // 如果字段包含逗号、引号或换行，需要加引号并转义内部引号
      if (/[",\n\r]/.test(field)) {
        return '"' + field.replace(/"/g, '""') + '"';
      }
      return field;
    },
    
    // 通用显示格式化文本的方法
    displayFormattedText(text, formatType) {
      const lines = text.split('\n');
      
      // 根据格式类型设置语法高亮
      const highlightedLines = lines.map(line => {
        if (formatType === 'yaml') {
          return this.highlightYaml(line);
        } else if (formatType === 'csv') {
          return this.highlightCsv(line);
        } else {
          return line;
        }
      });
      
      this.formattedJson = highlightedLines.map((line, index) => {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[0].length : 0;
        
        return {
          originalIndex: index,
          content: line,
          indent: formatType === 'yaml' ? Math.floor(indent / 2) : 0,
          type: `${formatType}-line`,
          collapsed: false
        };
      });
      
      // 清空折叠状态并刷新显示
      this.collapsedLines = new Set();
      this.processVisibleLines();
    },
    
    // YAML语法高亮
    highlightYaml(line) {
      // 高亮键
      line = line.replace(/^(\s*)([^:]*?)(:)(?=\s|$)/g, (match, space, key, colon) => {
        return `${space}<span class="yaml-key">${key}</span>${colon}`;
      });
      
      // 高亮值
      line = line.replace(/:\s+(.+?)$/g, (match, value) => {
        if (/^[0-9]+(\.[0-9]+)?$/.test(value)) {
          return `: <span class="yaml-number">${value}</span>`;
        } else if (/^(true|false)$/i.test(value)) {
          return `: <span class="yaml-boolean">${value}</span>`;
        } else if (/^null$/i.test(value)) {
          return `: <span class="yaml-null">${value}</span>`;
        } else if (/^".*"$/.test(value) || /^'.*'$/.test(value)) {
          return `: <span class="yaml-string">${value}</span>`;
        }
        return `: <span class="yaml-value">${value}</span>`;
      });
      
      // 高亮数组标记
      line = line.replace(/^(\s*)(-)(?=\s|$)/g, (match, space, dash) => {
        return `${space}<span class="yaml-array-marker">${dash}</span>`;
      });
      
      return line;
    },
    
    // CSV语法高亮
    highlightCsv(line) {
      // 简单地将CSV头行高亮
      if (line && this.formattedJson.length === 0) {
        return `<span class="csv-header">${line}</span>`;
      }
      
      // 分隔字段并单独高亮每个字段
      const fields = this.splitCsvFields(line);
      if (fields.length > 0) {
        return fields.map(field => `<span class="csv-field">${field}</span>`).join(',');
      }
      
      return line;
    },
    
    // 分割CSV字段，考虑引号内的逗号
    splitCsvFields(line) {
      const fields = [];
      let inQuotes = false;
      let currentField = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
          currentField += char;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      
      fields.push(currentField);
      return fields;
    },
    
    // 测量两侧面板头部宽度
    measurePanelsWidth() {
      // 使用防抖技术，避免频繁测量
      if (this._measureDebounceTimeout) {
        clearTimeout(this._measureDebounceTimeout);
      }
      
      this._measureDebounceTimeout = setTimeout(() => {
        this.$nextTick(() => {
          // 测量左侧面板头部宽度
          const leftHeader = this.$el.querySelector('.json-input-panel .panel-header');
          if (leftHeader) {
            const leftTitle = leftHeader.querySelector('h3');
            const leftActions = leftHeader.querySelector('.panel-actions');
            
            if (leftTitle && leftActions) {
              const leftTitleWidth = leftTitle.getBoundingClientRect().width;
              const leftActionsWidth = leftActions.getBoundingClientRect().width;
              
              // 计算内边距
              const leftStyle = window.getComputedStyle(leftHeader);
              const leftPaddingLeft = parseInt(leftStyle.paddingLeft) || 0;
              const leftPaddingRight = parseInt(leftStyle.paddingRight) || 0;
              
              // 计算左侧所需最小宽度（添加缓冲区）
              const leftMinWidth = leftTitleWidth + leftActionsWidth + leftPaddingLeft + leftPaddingRight + 40;
              
              // 更新左侧最小宽度（不小于基础最小宽度）
              this.leftMinPanelWidth = Math.max(this.minPanelWidth, leftMinWidth);
              
              console.log('左侧面板最小宽度:', this.leftMinPanelWidth, 'px');
            }
          }
          
          // 测量右侧面板头部宽度
          const rightHeader = this.$el.querySelector('.json-result-panel .panel-header');
          if (rightHeader) {
            const rightTitle = rightHeader.querySelector('h3');
            const rightActions = rightHeader.querySelector('.panel-actions');
            
            if (rightTitle && rightActions) {
              const rightTitleWidth = rightTitle.getBoundingClientRect().width;
              const rightActionsWidth = rightActions.getBoundingClientRect().width;
              
              // 计算内边距
              const rightStyle = window.getComputedStyle(rightHeader);
              const rightPaddingLeft = parseInt(rightStyle.paddingLeft) || 0;
              const rightPaddingRight = parseInt(rightStyle.paddingRight) || 0;
              
              // 计算右侧所需最小宽度（添加缓冲区）
              const rightMinWidth = rightTitleWidth + rightActionsWidth + rightPaddingLeft + rightPaddingRight + 40;
              
              // 更新右侧最小宽度（不小于基础最小宽度）
              this.rightMinPanelWidth = Math.max(this.minPanelWidth, rightMinWidth);
              
              console.log('右侧面板最小宽度:', this.rightMinPanelWidth, 'px');
            }
          }
          
          // 测量完成后调整面板宽度
          this.adjustPanelsWidth();
          
          // 调整面板宽度后，检查是否需要平滑过渡
          if (!this.isResizing) {
            this.animateToValidWidth();
          }
        });
      }, 100); // 100毫秒延迟
    },
    // 添加全屏相关的方法
    toggleFullScreen() {
      if (this.isFullScreen) {
        this.exitFullScreen();
      } else {
        this.enterFullScreen();
      }
    },
    
    enterFullScreen() {
      // 保存当前状态以便退出全屏时恢复
      this.previousPanelState = {
        leftPanelWidth: this.leftPanelWidth
      };
      
      // 开启全屏模式
      this.isFullScreen = true;
      
      // 防止滚动
      document.body.style.overflow = 'hidden';
      
      // 确保面板分配合理
      this.adjustPanelsWidth();
      
      // 通知用户进入全屏模式
      ToastService.info('已进入全屏模式');
    },
    
    exitFullScreen() {
      // 退出全屏
      this.isFullScreen = false;
      
      // 恢复滚动
      document.body.style.overflow = '';
      
      // 如果存在之前的状态，恢复
      if (this.previousPanelState) {
        this.leftPanelWidth = this.previousPanelState.leftPanelWidth;
      }
      
      // 通知用户退出全屏模式
      ToastService.info('已退出全屏模式');
    },
    
    // ESC键处理函数
    handleEscKey(event) {
      if (event.key === 'Escape' && this.isFullScreen) {
        this.exitFullScreen();
      }
    },
  }
};
