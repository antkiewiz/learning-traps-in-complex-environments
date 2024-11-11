import sys
#import experiment.stimuli_generator as stimgen
import stimuli_generator as stimgen
from alcoveRL import AlcoveRL
import numpy as np
from random import shuffle, random, randint
import multiprocessing
import subprocess
import csv
from itertools import product

def create_binary_exemplars(ndim):
    stimnums = range(pow(2, ndim))
    powers = [pow(2,i) for i in range(ndim)]
    exemplars = []
    for num in stimnums:
        stim = []
        for place in powers:
            if (num//place)%2:
                stim.append(1)
            else:
                stim.append(0)
        exemplars.append(stim)
    return exemplars

# utility for stretching shorter dim to have the same number of
# values as the longest dim. Unused values will be 0 for all stimuli
def stretch_vector(vec, newlen):
    newvec = [0] * newlen
    for i in range(len(vec)):
        newvec[i] = vec[i]
    return newvec

def runagent(args):
    exemplars, params, totalblocks, testblocks, condition, condition_settings, ndim, modelname, yoke_attention, env_fun, agentnum = args
    if condition_settings.get('fullinfo', False) or condition_settings.get('random_info', False):
        if yoke_attention:
            alc = AlcoveRL(exemplars , params, full_info=True, yoke_attention=True)
        else:
            alc = AlcoveRL(exemplars , params, full_info=True)
    elif condition_settings.get('constructivist', False):
        alc = AlcoveRL(exemplars, params, constructivist_encoding=True)
    elif condition_settings.get('individuate', False):
        alc = AlcoveRL( exemplars , params)
        alc.attention[-1] = .5
    else:
        if yoke_attention:
            alc = AlcoveRL(exemplars , params, yoke_attention=True)
        else:
            alc = AlcoveRL(exemplars , params)
    stimuli = env_fun(condition, 0, totalblocks, testblocks, ndim, **condition_settings)
    data = []
    for block in stimuli:
        for s in block:
            s['uniqueid'] = agentnum
            s['modelname'] = modelname
            mask = [0] * ndim
            feedback_mask = [0] * ndim
            if s['obscureNum'] > -1:
                mask[s['obscureNum']] = 1
                feedback_mask[s['obscureNum']] = 1
            elif condition_settings.get('individuate', False) and s['indiv_value'] == -1:
                mask.append(1)
                feedback_mask.append(1)
            elif condition_settings.get('individuate', False):
                mask.append(0)
                feedback_mask.append(0)
            stimnum = s['stimnum']
            if condition_settings.get('random_info', False)and not s['test'] and random() > 0.5:
                response, reward = alc.runtrial(stimnum,
                                                [s['ap_payoff'], s['av_payoff']],
                                                mask,
                                                feedback_mask,
                                                False)
                s['response'] = 1 - response
                s['reward'] = reward
            else:
                response, reward = alc.runtrial(stimnum,
                                                [s['ap_payoff'], s['av_payoff']],
                                                mask,
                                                feedback_mask,
                                                not s['test'])
                # model's action 0 is approach and action 1 is avoid, so switch them
                # for consistency with subjects code
                s['response'] = 1 - response
                s['reward'] = reward
            if s['category']!=response:
                s['correct'] = 1
            else:
                s['correct'] = 0
            for a in range(len(alc.attention)):
                s['att' + str(a)] = alc.attention[a]
            s['param_phi'] = alc.phi
            s['param_C'] = alc.C
            s['param_learn_w'] = alc.learn_w
            s['param_learn_a'] = alc.learn_a
            s['param_optimism'] = alc.optimism
            data.append(s)
    return data

def simulate_rl(modelname, env_fun=stimgen.stimuli_generator, numagents=100, ndim=4, condition=0,
                totalblocks=5, testblocks=0, params=None, yoke_attention=False, discard_training=False,
                condition_settings={}):
    if params is None:
        params = [40, 6, .1, 0.3, 0]
        # params = [4, 6, .1, 0.03, 0]
    exemplars = create_binary_exemplars(ndim)
    if condition_settings.get('individuate', False):
        numcolors = 2 ** ndim
        colors = [c % numcolors for c in range(len(exemplars))]
        shuffle(colors)
        for idx, exemplar in enumerate(exemplars):
            exemplar.append(colors[idx])
    pool = multiprocessing.Pool(processes=4)
    mapping_vec = []
    for n in range(numagents):
        mapping_vec.append((exemplars, params, totalblocks,
                            testblocks, condition, condition_settings, ndim, modelname, yoke_attention, env_fun, n))
    all_agent_data = pool.map(runagent, mapping_vec)
    # all_agent_data = map(runagent, mapping_vec)
    if discard_training:
        all_agent_data = [data[-(2**ndim * testblocks):] for data in all_agent_data]
    all_agent_data = [s for data in all_agent_data for s in data]
    print ("finished", modelname)
    return all_agent_data

def run_parametergrid():
    phi_vals = [5, 10, 20, 40]
    C_vals = [3,6,12]
    learn_w_vals = [.05,.1,.2]
    learn_a_vals = [.03,.1,.3]
    optimism_vals = [0]

    param_combinations = product(phi_vals, C_vals, learn_w_vals, learn_a_vals, optimism_vals)

    def run_params(params):
        return simulate_rl("standard", numagents=200, totalblocks=30, testblocks=1, discard_training=True, params=params)

    all_data = map(run_params, param_combinations)
    all_data = [s for run in all_data for s in run]
    keys = all_data[-1].keys()
    with open('models_paramgrid.csv', 'w') as f:
        dict_writer = csv.DictWriter(f, keys)
        dict_writer.writeheader()
        dict_writer.writerows(all_data)


def run_models():
    all_data = [
        simulate_rl("simple_3d", numagents=1000, totalblocks=21, testblocks=1, ndim = 3),
        simulate_rl("medium_4d", numagents=1000, totalblocks=21, testblocks=1, ndim = 4),
        simulate_rl("complex_5d", numagents=1000, totalblocks=21, testblocks=1, ndim = 5),
    ]
    all_data = [s for cond in all_data for s in cond]
    keys = all_data[-1].keys()
    with open('models_bycomplexity.csv', 'w') as f:
        dict_writer = csv.DictWriter(f, keys)
        dict_writer.writeheader()
        dict_writer.writerows(all_data)


def main():
    run_models()


if __name__ == '__main__':
    main()

