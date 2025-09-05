'use client';

import axios from 'axios';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import {
    FieldValues,
    SubmitHandler,
    useForm
} from 'react-hook-form';
import { User } from '@prisma/client';

import Input from '@/app/components/inputs/Input';
import Select from '@/app/components/inputs/Select';
import Modal from '@/app/components/modals/Modal';
import Button from '@/app/components/Button';
import DateTimePicker from '@/app/components/inputs/Time';

interface GroupChatModalProps {
    isOpen?: boolean;
    onClose: () => void;
    users: User[];
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({
    isOpen,
    onClose,
    users = []
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        }
    } = useForm<FieldValues>({
        defaultValues: {
            datetime: "",
            message: "",
            members: []
        }
    });

    const members = watch('members');

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        axios.post('/api/scheduler', {
            ...data
        })
            .then(() => {
                router.refresh();
                onClose();
                setValue('message', '', { shouldValidate: true });
                setValue('datetime', '', { shouldValidate: true });
                setValue('members', '', { shouldValidate: true });
            })
            .catch((err) => console.log(err))
            .finally(() => setIsLoading(false));

    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2
                            className="
                text-base 
                font-semibold 
                leading-7 
                text-gray-900
              "
                        >
                            Schedule a message
                        </h2>
                        <div className="mt-10 flex flex-col gap-y-8">
                            <DateTimePicker
                                label="Date and Time"
                                id="datetime"
                                register={register}
                                required
                                errors={errors}
                                disabled={false}
                            />
                            <Input
                                disabled={isLoading}
                                label="Message"
                                id="message"
                                errors={errors}
                                required
                                register={register}
                            />
                            <Select
                                disabled={isLoading}
                                label="Members"
                                options={users.map((user) => ({
                                    value: user.id,
                                    label: user.name
                                }))}
                                onChange={(value) => setValue('members', value, {
                                    shouldValidate: true
                                })}
                                value={members}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Button
                        disabled={isLoading}
                        onClick={onClose}
                        type="button"
                        secondary
                    >
                        Cancel
                    </Button>
                    <Button disabled={isLoading} type="submit">
                        Create
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default GroupChatModal;
