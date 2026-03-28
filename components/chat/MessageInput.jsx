import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export const MessageInput = ({ onSendMessage, onTyping, onStopTyping, disabled = false }) => {
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim() && onTyping) {
      onTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 1000);
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = inputRef.current.selectionStart;
    const textBefore = input.slice(0, cursorPosition);
    const textAfter = input.slice(cursorPosition);

    setInput(textBefore + emoji + textAfter);

    // Focus back to input and set cursor position
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
    }, 0);

    setShowEmojiPicker(false);
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (input.trim() && onSendMessage) {
      onSendMessage(input);
      setInput('');
      setShowEmojiPicker(false);
      if (onStopTyping) {
        onStopTyping();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full right-0 mb-2 z-50"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="light"
            skinTonesDisabled
            searchDisabled={false}
            previewConfig={{
              showPreview: false,
            }}
            width={320}
            height={400}
          />
        </div>
      )}

      <form onSubmit={handleSend} className="p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition transform hover:scale-110"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: '48px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-3 p-1 text-purple-600 hover:bg-purple-100 rounded-lg transition transform hover:scale-110"
              title="Add emoji"
            >
              <Smile size={20} />
            </button>
          </div>

          {/* Voice Message Button */}
          <button
            type="button"
            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition transform hover:scale-110"
            title="Voice message"
          >
            <Mic size={20} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl disabled:cursor-not-allowed flex items-center gap-2 transition transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Character Count */}
        {input.length > 0 && (
          <div className="text-xs text-purple-500 mt-2 text-right">
            {input.length} characters
          </div>
        )}
      </form>
    </div>
  );
};
