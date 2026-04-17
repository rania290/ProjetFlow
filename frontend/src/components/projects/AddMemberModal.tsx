import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, UserPlus, Search, Check, 
    Shield, Briefcase, Mail, Star,
    ChevronRight, Info, Loader2
} from 'lucide-react';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminApi } from '@/api/admin.api';
import type { User } from '@/types/auth.types';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (member: any) => void;
    existingMemberIds?: string[];
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen, onClose, onAdd, existingMemberIds = []
}) => {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tjm, setTjm] = useState(450);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                setIsLoading(true);
                try {
                    const data = await adminApi.getAllUsers();
                    // On ne propose que les utilisateurs qui ne sont pas déjà membres
                    const availableUsers = (data || []).filter(u => !existingMemberIds.includes(u.id));
                    setUsers(availableUsers);
                } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs:", error);
                    setUsers([]);
                } finally {
                    setIsLoading(false);
                }
            };
            void fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const filtered = users.filter(u => 
        (u.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const handleAdd = () => {
        const userToAdd = users.find(u => u.id === selectedId);
        if (userToAdd) {
            onAdd({
                id: userToAdd.id,
                fullName: userToAdd.fullName || 'Utilisateur',
                email: userToAdd.email,
                role: userToAdd.role || 'CONTRIBUTOR',
                avatar: userToAdd.fullName?.charAt(0) || 'U',
                tjm: tjm
            });
            onClose();
            setSelectedId(null);
            setTjm(450);
            setSearch('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
                {/* Elegant Premium Header */}
                <div className="relative px-8 pt-8 pb-6 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20">
                            <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">Inviter Membre</DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">Sélectionner parmis les utilisateurs système</DialogDescription>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input 
                            placeholder="Rechercher par nom ou email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/30 font-medium text-sm focus-visible:ring-indigo-500/20 transition-all"
                        />
                    </div>

                    <ScrollArea className="h-72 pr-4 custom-scrollbar">
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Récupération des utilisateurs...</p>
                                </div>
                            ) : filtered.length > 0 ? (
                                filtered.map(member => (
                                    <button
                                        key={member.id}
                                        onClick={() => setSelectedId(member.id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all group relative",
                                            selectedId === member.id 
                                                ? "border-indigo-600 bg-indigo-50/50" 
                                                : "border-transparent hover:bg-slate-50 active:scale-98"
                                        )}
                                    >
                                        <Avatar className="w-12 h-12 rounded-xl ring-4 ring-slate-100 transition-all group-hover:ring-indigo-100 shrink-0">
                                            <AvatarFallback className="bg-white text-indigo-600 font-black text-sm">
                                                {member.fullName?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left flex-1 min-w-0">
                                            <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">
                                                {member.fullName || 'Sans nom'}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-medium italic truncate">{member.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[8px] font-black bg-white border-slate-100 text-slate-400">
                                                {member.role}
                                            </Badge>
                                            {selectedId === member.id && (
                                                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 animate-in zoom-in-50 duration-200">
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <X className="w-6 h-6 text-slate-200" />
                                    </div>
                                    <div className="opacity-40 italic text-xs font-bold uppercase tracking-widest text-slate-400">
                                        {search ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="px-8 py-6 bg-white border-t border-slate-100 flex items-center shadow-[0_-8px_20px_rgba(0,0,0,0.02)] sm:justify-start">
                    <div className="flex items-center w-full">
                        {/* LEFT: Buttons */}
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleAdd}
                                disabled={!selectedId || isLoading}
                                className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.1em] shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <Check className="w-3.5 h-3.5" /> Ajouter
                            </Button>

                            <Button variant="ghost" onClick={onClose} className="h-9 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                                Fermer
                            </Button>
                        </div>

                        {/* RIGHT: TJM */}
                        <div className="flex items-center gap-2 ml-auto">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-0.5">TJM</label>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    min={0} 
                                    value={tjm} 
                                    onChange={e => setTjm(parseInt(e.target.value) || 0)}
                                    className="h-9 w-20 rounded-lg border-slate-200 bg-slate-50/50 font-black text-xs text-indigo-600 text-right pr-6 focus:ring-indigo-500/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    placeholder="0"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 select-none">
                                    DT
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
