import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
    X, Paperclip, Smile, Image as ImageIcon, Send, AtSign,
    CheckCircle2, List as ListIcon, Bold, Italic, Underline,
    Strikethrough, Type, Highlighter, ListOrdered, Outdent,
    Indent, Quote, Link, Minus, CheckSquare, Pilcrow,
    ChevronDown, Pencil, Gift as GifIcon, FileIcon, Trash2,
    MessageCircle, Clock, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import tippy from 'tippy.js';
import { useAuth } from '../../hooks/useAuth';

export interface Member {
    id: string;
    fullName: string;
    avatar?: string;
}

const renderAvatar = (avatar: string | undefined, fullName: string) => {
    if (avatar && avatar.length > 5) {
        const src = avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/')
            ? avatar
            : `data:image/jpeg;base64,${avatar}`;
        return <img src={src} alt={fullName} className="w-full h-full object-cover rounded-full" />;
    }
    return avatar || fullName.charAt(0);
};

export interface UpdateReply {
    id: string;
    content: string;
    author: Member;
    createdAt: Date;
    likes: string[];
}

export interface BoardUpdate {
    id: string;
    content: string;
    author: Member;
    createdAt: Date;
    attachments: { name: string; url?: string; type?: string }[];
    likes: string[];
    replies: UpdateReply[];
}

interface BoardDiscussionPanelProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    members?: Member[];
}

// Mention List Component for Tiptap
const MentionList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command({ id: item.id, label: item.fullName });
        }
    };

    const upHandler = () => {
        setSelectedIndex(((selectedIndex + props.items.length - 1) % props.items.length));
    };

    const downHandler = () => {
        setSelectedIndex(((selectedIndex + 1) % props.items.length));
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: any) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden min-w-[200px] z-[1000]">
            {props.items.length ? (
                props.items.map((item: Member, index: number) => (
                    <button
                        key={item.id}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-blue-50 transition-colors ${index === selectedIndex ? 'bg-blue-50' : ''}`}
                        onClick={() => selectItem(index)}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden">
                            {renderAvatar(item.avatar, item.fullName)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{item.fullName}</p>
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-4 py-2 text-sm text-slate-400 font-medium italic">Aucun membre trouvé</div>
            )}
        </div>
    );
});

MentionList.displayName = 'MentionList';

export const BoardDiscussionPanel: React.FC<BoardDiscussionPanelProps> = ({
    isOpen,
    onClose,
    projectName,
    members = []
}) => {
    const [attachments, setAttachments] = useState<File[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [updates, setUpdates] = useState<BoardUpdate[]>([]);
    const [isEditorExpanded, setIsEditorExpanded] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<{ name: string, url?: string, type?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    const currentUser: Member = user
        ? {
            id: user.id || 'u1',
            fullName: user.fullName || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Utilisateur Actuel'),
            avatar: user.profilePhoto || user.avatar || undefined
        }
        : (members[0] || { id: 'u1', fullName: 'Utilisateur Actuel', avatar: 'UA' });

    const toggleLike = (updateId: string) => {
        setUpdates(updates.map(u => {
            if (u.id === updateId) {
                const hasLiked = u.likes.includes(currentUser.id);
                return {
                    ...u,
                    likes: hasLiked ? u.likes.filter(id => id !== currentUser.id) : [...u.likes, currentUser.id]
                };
            }
            return u;
        }));
    };

    const handleAddReply = (updateId: string, replyContent: string) => {
        const newReply: UpdateReply = {
            id: Date.now().toString(),
            content: replyContent,
            author: currentUser,
            createdAt: new Date(),
            likes: []
        };
        setUpdates(updates.map(u => {
            if (u.id === updateId) {
                return { ...u, replies: [...u.replies, newReply] };
            }
            return u;
        }));
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Écrivez une mise à jour...',
            }),
            Highlight,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention bg-blue-100 text-blue-700 px-1 rounded font-bold',
                },
                suggestion: {
                    items: ({ query }) => {
                        return members
                            .filter(item => item.fullName.toLowerCase().startsWith(query.toLowerCase()))
                            .slice(0, 5);
                    },
                    render: () => {
                        let component: ReactRenderer;
                        let popup: any;

                        return {
                            onStart: (props) => {
                                component = new ReactRenderer(MentionList, {
                                    props,
                                    editor: props.editor,
                                });

                                if (!props.clientRect) {
                                    return;
                                }

                                popup = tippy('body', {
                                    getReferenceClientRect: props.clientRect as any,
                                    appendTo: () => document.body,
                                    content: component.element,
                                    showOnCreate: true,
                                    interactive: true,
                                    trigger: 'manual',
                                    placement: 'bottom-start',
                                })[0];
                            },

                            onUpdate(props) {
                                component.updateProps(props);

                                if (!props.clientRect) {
                                    return;
                                }

                                popup.setProps({
                                    getReferenceClientRect: props.clientRect as any,
                                });
                            },

                            onKeyDown(props) {
                                if (props.event.key === 'Escape') {
                                    popup.hide();
                                    return true;
                                }

                                return (component.ref as any)?.onKeyDown(props);
                            },

                            onExit() {
                                popup.destroy();
                                component.destroy();
                            },
                        };
                    },
                },
            }),
        ],
        content: '',
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments([...attachments, ...Array.from(e.target.files)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const addEmoji = (emoji: string) => {
        editor?.chain().focus().insertContent(emoji).run();
        setShowEmojiPicker(false);
    };

    const handleSubmit = () => {
        if (!editor || (editor.isEmpty && attachments.length === 0)) return;

        const content = editor.getHTML();

        const newUpdate: BoardUpdate = {
            id: Date.now().toString(),
            content,
            author: currentUser,
            createdAt: new Date(),
            attachments: attachments.map(f => ({ name: f.name, url: URL.createObjectURL(f), type: f.type })),
            likes: [],
            replies: []
        };

        setUpdates([newUpdate, ...updates]);

        // Reset
        editor.commands.clearContent();
        setAttachments([]);
        setIsEditorExpanded(false);
    };

    // Common emojis for the quick picker
    const commonEmojis = ['😊', '👍', '🔥', '🚀', '✅', '💡', '🎉', '❤️', '🤔', '🙌'];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <AnimatePresence>
                        {selectedAttachment && selectedAttachment.url && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4"
                                onClick={() => setSelectedAttachment(null)}
                            >
                                <button
                                    className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[201]"
                                    onClick={() => setSelectedAttachment(null)}
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div
                                    className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {selectedAttachment.type?.startsWith('image/') || selectedAttachment.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                        <img
                                            src={selectedAttachment.url}
                                            alt={selectedAttachment.name}
                                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                        />
                                    ) : (
                                        <div className="bg-white rounded-xl p-8 flex flex-col items-center max-w-sm text-center">
                                            <FileIcon className="w-16 h-16 text-blue-500 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800 mb-2 truncate w-full">{selectedAttachment.name}</h3>
                                            <p className="text-slate-500 text-sm mb-6">Aperçu non disponible pour ce type de fichier.</p>
                                            <a
                                                href={selectedAttachment.url}
                                                download={selectedAttachment.name}
                                                className="px-6 py-2.5 bg-[#0073ea] hover:bg-[#0060c2] text-white font-semibold rounded-lg shadow-sm transition-colors"
                                            >
                                                Télécharger
                                            </a>
                                        </div>
                                    )}
                                    {selectedAttachment.type?.startsWith('image/') || selectedAttachment.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                        <div className="absolute -bottom-10 left-0 right-0 text-center text-white/90 font-medium text-sm">
                                            {selectedAttachment.name}
                                        </div>
                                    ) : null}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[100]"
                    />

                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-[650px] bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.1)] z-[101] flex flex-col border-l border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-6">
                            <div className="flex items-center gap-6 mb-4">
                                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-7 h-7 stroke-[1.5]" />
                                </button>
                                <div className="flex-1">
                                    <h2 className="text-[32px] font-black text-[#333333] tracking-tight leading-none mb-2">
                                        Board Discussion
                                    </h2>
                                    <span className="text-base font-medium text-slate-500">{projectName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Feed Area */}
                        <div className="flex flex-col flex-1 overflow-hidden bg-slate-50/50">
                            {/* Editor Area */}
                            <div className="px-8 pt-6 pb-4 shrink-0 bg-white border-b border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10">
                                <div
                                    className={`border border-slate-200 focus-within:border-[#0073ea] focus-within:shadow-[0_0_0_4px_rgba(0,115,234,0.1)] rounded-xl overflow-hidden flex flex-col bg-white transition-all duration-200 ${!isEditorExpanded ? 'cursor-text hover:border-[#0073ea]/50' : ''}`}
                                    onClick={() => !isEditorExpanded && setIsEditorExpanded(true)}
                                >
                                    {/* Top Toolbar */}
                                    {isEditorExpanded && (
                                        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-slate-100 bg-white">
                                            <ToolbarButton
                                                icon={<Bold className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                                active={editor?.isActive('bold')}
                                            />
                                            <ToolbarButton
                                                icon={<Italic className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                                active={editor?.isActive('italic')}
                                            />
                                            <ToolbarButton
                                                icon={<Underline className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                                active={editor?.isActive('underline')}
                                            />
                                            <ToolbarButton
                                                icon={<Strikethrough className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleStrike().run()}
                                                active={editor?.isActive('strike')}
                                            />
                                            <ToolbarDivider />
                                            <ToolbarButton
                                                icon={<Quote className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                                active={editor?.isActive('blockquote')}
                                            />
                                            <ToolbarButton
                                                icon={<ListIcon className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                                active={editor?.isActive('bulletList')}
                                            />
                                            <ToolbarButton
                                                icon={<ListOrdered className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                                active={editor?.isActive('orderedList')}
                                            />
                                            <ToolbarDivider />
                                            <ToolbarButton
                                                icon={<CheckSquare className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                                                active={editor?.isActive('taskList')}
                                            />
                                            <ToolbarButton
                                                icon={<Highlighter className="w-4 h-4" />}
                                                onClick={() => editor?.chain().focus().toggleHighlight().run()}
                                                active={editor?.isActive('highlight')}
                                            />
                                        </div>
                                    )}

                                    {/* Tiptap Content */}
                                    <div className={`bg-white overflow-y-auto ${isEditorExpanded ? 'p-4 min-h-[100px] max-h-[250px]' : 'px-4 py-3 min-h-[48px]'} scrollbar-thin scrollbar-thumb-slate-200 cursor-text`} onClick={() => editor?.commands.focus()}>
                                        <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none min-h-full" />
                                    </div>

                                    {/* Attachments Preview */}
                                    {attachments.length > 0 && (
                                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
                                            {attachments.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 shadow-sm">
                                                    <FileIcon className="w-3 h-3 text-blue-500" />
                                                    <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                                    <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500 ml-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bottom Toolbar */}
                                    {isEditorExpanded && (
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100 relative">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => editor?.chain().focus().insertContent('@').run()}
                                                    className="p-1.5 text-slate-400 hover:text-[#0073ea] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Mentionner (@)"
                                                >
                                                    <AtSign className="w-5 h-5 stroke-[1.5]" />
                                                </button>

                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-1.5 text-slate-400 hover:text-[#0073ea] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ajouter un fichier"
                                                >
                                                    <Paperclip className="w-5 h-5 stroke-[1.5]" />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                />

                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowEmojiPicker(!showEmojiPicker);
                                                        }}
                                                        className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'text-[#0073ea] bg-blue-50' : 'text-slate-400 hover:text-[#0073ea] hover:bg-blue-50'}`}
                                                        title="Emojis"
                                                    >
                                                        <Smile className="w-5 h-5 stroke-[1.5]" />
                                                    </button>

                                                    <AnimatePresence>
                                                        {showEmojiPicker && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                className="absolute bottom-full left-0 mb-2 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 rounded-xl p-3 flex flex-wrap gap-1 z-[200] w-[200px]"
                                                            >
                                                                {commonEmojis.map(emoji => (
                                                                    <button
                                                                        key={emoji}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            addEmoji(emoji);
                                                                        }}
                                                                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-xl transition-all hover:scale-125"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 h-8">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsEditorExpanded(false); }}
                                                    className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                                                    disabled={!editor || (editor.isEmpty && attachments.length === 0)}
                                                    className="h-full px-5 bg-[#0073ea] hover:bg-[#0060c2] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded shadow-sm shadow-blue-500/20 transition-all"
                                                >
                                                    Mettre à jour
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Updates List Scroll */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-slate-200">
                                {updates.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70 mt-10">
                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
                                            <MessageCircle className="w-10 h-10 text-blue-400 stroke-[1.5]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-700 mb-1">Commencez la discussion</h3>
                                        <p className="text-sm text-slate-500 max-w-[250px]">Partagez des mises à jour, posez des questions ou mentionnez un membre de l'équipe.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 pb-20">
                                        {updates.map(update => (
                                            <UpdateCard
                                                key={update.id}
                                                update={update}
                                                currentUser={currentUser}
                                                onLike={() => toggleLike(update.id)}
                                                onReplySubmit={(updateId, content) => handleAddReply(updateId, content)}
                                                onAttachmentClick={setSelectedAttachment}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const UpdateCard: React.FC<{
    update: BoardUpdate,
    currentUser: Member,
    onLike: () => void,
    onReplySubmit: (updateId: string, replyContent: string) => void,
    onAttachmentClick: (attachment: { name: string, url?: string, type?: string }) => void
}> = ({ update, currentUser, onLike, onReplySubmit, onAttachmentClick }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const hasLiked = update.likes.includes(currentUser.id);

    const handleReply = () => {
        if (!replyText.trim()) return;
        onReplySubmit(update.id, replyText);
        setReplyText('');
        setIsReplying(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0073ea] to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white overflow-hidden">
                            {renderAvatar(update.author.avatar, update.author.fullName)}
                        </div>
                        <div>
                            <h4 className="text-[15px] font-bold text-slate-800 leading-tight">{update.author.fullName}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{update.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-[#0073ea] p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-normal tiptap-content"
                    dangerouslySetInnerHTML={{ __html: update.content }} />

                {update.attachments.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {update.attachments.map((file, i) => (
                            <div
                                key={i}
                                onClick={() => onAttachmentClick(file)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 font-medium hover:bg-slate-100 transition-colors cursor-pointer group"
                            >
                                {file.type?.startsWith('image/') || file.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                    <ImageIcon className="w-4 h-4 text-[#0073ea] group-hover:scale-110 transition-transform" />
                                ) : (
                                    <FileIcon className="w-4 h-4 text-[#0073ea] group-hover:scale-110 transition-transform" />
                                )}
                                <span className="truncate max-w-[200px]">{file.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onLike}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${hasLiked ? 'text-[#0073ea]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm">
                            <Smile className={`w-4 h-4 ${hasLiked ? 'text-[#0073ea]' : 'text-slate-400'}`} />
                        </span>
                        J'aime {update.likes.length > 0 && <span className="bg-[#0073ea]/10 text-[#0073ea] px-1.5 rounded-full text-xs ml-0.5">{update.likes.length}</span>}
                    </button>

                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors group ${isReplying || update.replies.length > 0 ? 'text-[#0073ea]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm group-hover:border-slate-300 transition-colors">
                            <MessageCircle className={`w-4 h-4 ${isReplying || update.replies.length > 0 ? 'text-[#0073ea]' : 'text-slate-400 group-hover:text-slate-500'}`} />
                        </span>
                        Répondre {update.replies.length > 0 && <span className="bg-[#0073ea]/10 text-[#0073ea] px-1.5 rounded-full text-xs ml-0.5">{update.replies.length}</span>}
                    </button>
                </div>

                {update.replies.length > 0 && (
                    <div className="mt-2 space-y-3 pt-3 border-t border-slate-200/60">
                        {update.replies.map(r => (
                            <div key={r.id} className="flex gap-3 relative">
                                <div className="absolute left-3.5 top-8 bottom-0 w-px bg-slate-200/60 -z-10" />
                                <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 z-10 shadow-sm overflow-hidden">
                                    {renderAvatar(r.author.avatar, r.author.fullName)}
                                </div>
                                <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-800 text-[13px]">{r.author.fullName}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{r.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-normal">{r.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isReplying && (
                    <div className={`flex items-start gap-3 ${update.replies.length > 0 ? 'mt-2' : 'mt-3 pt-3 border-t border-slate-200/60'}`}>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0073ea] to-indigo-500 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-white z-10 overflow-hidden">
                            {renderAvatar(currentUser.avatar, currentUser.fullName)}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                autoFocus
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply();
                                    }
                                }}
                                placeholder="Écrivez une réponse..."
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0073ea] focus:ring-1 focus:ring-[#0073ea] min-h-[44px] resize-none shadow-sm transition-all pr-12"
                                rows={1}
                            />
                            <button
                                onClick={handleReply}
                                disabled={!replyText.trim()}
                                className="absolute right-2 bottom-2 p-1.5 text-white bg-[#0073ea] hover:bg-[#0060c2] rounded-lg disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm"
                            >
                                <Send className="w-3.5 h-3.5 -ml-0.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ToolbarButton: React.FC<{
    icon: React.ReactNode,
    onClick?: () => void,
    active?: boolean
}> = ({ icon, onClick, active }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded transition-colors group ${active ? 'bg-blue-50 text-[#0073ea]' : 'text-slate-600 hover:bg-slate-100'}`}
    >
        <div className="group-hover:scale-110 transition-transform">
            {icon}
        </div>
    </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-slate-100 mx-1" />;
